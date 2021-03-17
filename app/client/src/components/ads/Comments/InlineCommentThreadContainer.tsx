import React from "react";
import { useDispatch } from "react-redux";

import CommentCard from "./CommentCard";
import AddCommentInput from "./AddCommentInput";
import {
  ThreadContainer,
  ThreadHeader,
  ThreadHeaderTitle,
  CommentsContainer,
} from "./StyledComponents";

import { addCommentToThreadRequest } from "actions/commentActions";
import { CommentThread } from "reducers/uiReducers/commentsReducer";

const InlineCommentThreadContainer = ({
  commentThread,
}: {
  commentThread: CommentThread;
}) => {
  const dispatch = useDispatch();
  const { comments } = commentThread;
  const addComment = (text: string) => {
    dispatch(
      addCommentToThreadRequest({
        commentThread,
        commentBody: text,
      }),
    );
  };

  return (
    <ThreadContainer>
      <ThreadHeader>
        <ThreadHeaderTitle>Comments</ThreadHeaderTitle>
      </ThreadHeader>
      <CommentsContainer>
        {comments &&
          comments.map((comment, index) => (
            <CommentCard key={index} comment={comment} />
          ))}
      </CommentsContainer>
      <AddCommentInput onSave={addComment} />
    </ThreadContainer>
  );
};

export default InlineCommentThreadContainer;
