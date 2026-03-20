import uuid as uuid_mod

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.dependencies import get_current_active_user
from app.database import get_db
from app.models.community import CommunityPost, PostComment, PostLike
from app.models.user import User
from app.notifications import create_notification
from app.schemas.community import CommentCreate, CommentResponse, PostCreate, PostResponse
from app.schemas.user import UserProfile

router = APIRouter(prefix="/community", tags=["community"])


def _post_to_response(post: CommunityPost, current_user_id: uuid_mod.UUID) -> PostResponse:
    liked = any(like.user_id == current_user_id for like in post.likes)
    author = UserProfile.model_validate(post.user) if post.user else None
    return PostResponse(
        id=post.id,
        user_id=post.user_id,
        post_type=post.post_type,
        content=post.content,
        reference_id=post.reference_id,
        image_url=post.image_url,
        likes_count=post.likes_count,
        comments_count=post.comments_count,
        created_at=post.created_at,
        updated_at=post.updated_at,
        author=author,
        liked_by_me=liked,
    )


@router.get("/feed", response_model=list[PostResponse])
async def get_feed(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CommunityPost)
        .options(selectinload(CommunityPost.user), selectinload(CommunityPost.likes))
        .order_by(CommunityPost.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    posts = result.scalars().unique().all()
    return [_post_to_response(p, current_user.id) for p in posts]


@router.post("/posts", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    data: PostCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    post = CommunityPost(user_id=current_user.id, **data.model_dump())
    db.add(post)
    await db.flush()

    # Notifier tous les autres utilisateurs actifs
    other_users_result = await db.execute(
        select(User.id).where(User.id != current_user.id)
    )
    other_user_ids = other_users_result.scalars().all()
    for uid in other_user_ids:
        await create_notification(
            db,
            user_id=uid,
            type="new_post",
            title="Nouveau post dans la communauté !",
            message=f"{current_user.first_name} {current_user.last_name} a publié quelque chose.",
            link="/community",
        )

    result = await db.execute(
        select(CommunityPost)
        .where(CommunityPost.id == post.id)
        .options(selectinload(CommunityPost.user), selectinload(CommunityPost.likes))
    )
    post = result.scalar_one()
    return _post_to_response(post, current_user.id)


@router.get("/posts/{post_id}", response_model=PostResponse)
async def get_post(
    post_id: uuid_mod.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CommunityPost)
        .where(CommunityPost.id == post_id)
        .options(selectinload(CommunityPost.user), selectinload(CommunityPost.likes))
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return _post_to_response(post, current_user.id)


@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: uuid_mod.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(CommunityPost).where(CommunityPost.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    if post.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Can only delete your own posts")
    await db.delete(post)
    return None


@router.post("/posts/{post_id}/like", response_model=PostResponse)
async def toggle_like(
    post_id: uuid_mod.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(CommunityPost).where(CommunityPost.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    like_result = await db.execute(
        select(PostLike).where(PostLike.post_id == post_id, PostLike.user_id == current_user.id)
    )
    existing_like = like_result.scalar_one_or_none()

    if existing_like:
        await db.delete(existing_like)
        post.likes_count = max(0, post.likes_count - 1)
    else:
        like = PostLike(post_id=post_id, user_id=current_user.id)
        db.add(like)
        post.likes_count += 1

        if post.user_id != current_user.id:
            await create_notification(
                db,
                user_id=post.user_id,
                type="like",
                title="Nouveau like !",
                message=f"{current_user.first_name} {current_user.last_name} a aimé ton post.",
                link="/community",
            )

    await db.flush()

    result = await db.execute(
        select(CommunityPost)
        .where(CommunityPost.id == post_id)
        .options(selectinload(CommunityPost.user), selectinload(CommunityPost.likes))
    )
    post = result.scalar_one()
    return _post_to_response(post, current_user.id)


@router.post("/posts/{post_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def add_comment(
    post_id: uuid_mod.UUID,
    data: CommentCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(CommunityPost).where(CommunityPost.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    comment = PostComment(post_id=post_id, user_id=current_user.id, content=data.content)
    db.add(comment)
    post.comments_count += 1

    if post.user_id != current_user.id:
        await create_notification(
            db,
            user_id=post.user_id,
            type="comment",
            title="Nouveau commentaire !",
            message=f"{current_user.first_name} {current_user.last_name} a commenté ton post.",
            link="/community",
        )

    await db.flush()

    result = await db.execute(
        select(PostComment)
        .where(PostComment.id == comment.id)
        .options(selectinload(PostComment.user))
    )
    comment = result.scalar_one()
    author = UserProfile.model_validate(comment.user) if comment.user else None
    return CommentResponse(
        id=comment.id,
        post_id=comment.post_id,
        user_id=comment.user_id,
        content=comment.content,
        created_at=comment.created_at,
        updated_at=comment.updated_at,
        author=author,
    )


@router.get("/posts/{post_id}/comments", response_model=list[CommentResponse])
async def list_comments(
    post_id: uuid_mod.UUID,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(PostComment)
        .where(PostComment.post_id == post_id)
        .options(selectinload(PostComment.user))
        .order_by(PostComment.created_at.asc())
        .offset(offset)
        .limit(limit)
    )
    comments = result.scalars().unique().all()
    responses = []
    for c in comments:
        author = UserProfile.model_validate(c.user) if c.user else None
        responses.append(CommentResponse(
            id=c.id,
            post_id=c.post_id,
            user_id=c.user_id,
            content=c.content,
            created_at=c.created_at,
            updated_at=c.updated_at,
            author=author,
        ))
    return responses


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: uuid_mod.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(PostComment)
        .where(PostComment.id == comment_id)
        .options(selectinload(PostComment.post))
    )
    comment = result.scalar_one_or_none()
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Can only delete your own comments")

    comment.post.comments_count = max(0, comment.post.comments_count - 1)
    await db.delete(comment)
    return None
