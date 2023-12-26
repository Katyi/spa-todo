import MyButton from "../components/UI/button/MyButton";

const CommentItem = (props) => {
  return (
    <div className='comment'>
      <div className='commentNumber'>{props.comment.commentNumber}</div>
      <div className='comment_comment'>{props.comment.comment}</div>
      <div className="comment_bts">
        <MyButton 
          style={{width: 120, marginLeft: 3}}
          type="button"
          onClick={() => {
            props.setModal(true);
            props.getComment(props.comment);
          }}
        >
          Update
        </MyButton >
      <MyButton onClick={() => props.remove(props.comment)} style={{width: 120, marginLeft: 3}}>Delete</MyButton>
      </div>
    </div>
  );
};

export default CommentItem;