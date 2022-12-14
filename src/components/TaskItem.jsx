import React, { useState } from "react";
import MyButton from "../components/UI/button/MyButton";
import { Link, useNavigate } from 'react-router-dom';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { updateDoc, doc} from 'firebase/firestore';
import { db } from '../firebase';
import { storage } from '../firebase';
import MyInput from "./UI/input/MyInput";
import { useDrag } from 'react-dnd';
import { ItemTypes } from '../ItemTypes';

const TaskItem = (props) => {
  const [progress, setProgress] = useState(0);
  const [inDrag, setInDrag] = useState(false);

  const handleDrag = () => {
    setInDrag(!inDrag);
  }

  // -----Загрузка файла для задачи-------------------------------------------------------------------------------------
  const handleUpload = (e) => {
    e.preventDefault();
    const file = e.target[0].files[0];
    let arr = [].slice.call(e.target.parentElement.children);
    console.log(arr);
    uploadFiles(file);
    
  }
  
  const uploadFiles = async (file) => {
    if (!file) return;
    const sotrageRef = ref(storage, `files/${file.name}`);
    const uploadTask = uploadBytesResumable(sotrageRef, file);
    let fileName = file.name;

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const prog = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgress(prog);
      },
      (error) => console.log("Error", error),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log("File available at", downloadURL);
          recordUrl(downloadURL, fileName);
        });
      }
    );
  };
  // -----Выгрузка ссылки загруженного файла для задачи-------------------------------------------------------------------------------------
  const recordUrl = async (url, fileName) => {
    await updateDoc(doc(db, 'tasks', props.task.id), {
      fileUrl: url,
      fileName: fileName,
    });
    // window.location.reload();
    // props.firebaseQuery();
  }

  let navigate = useNavigate();

  //      drag-n-drop                                                                                                                       
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.BOX,
    item: props.task,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })
  )

  return (
    <div className='task' ref={drag}>
      <div className='taskNumber'>{props.task.taskNumber}</div>
      <div className='taskName'>{props.task.taskName}</div>
      {isDragging}
      <MyButton>  
        <Link className="createUpdDelBtn" to="/UpdateTask" state={{ task: props.task }}> Open/Update </Link>
      </MyButton>
      <MyButton onClick={() => props.remove(props.task.id)} style={{width: 120, marginBottom: 10}}>Delete</MyButton>
      {!props.task.isSubtask && <MyButton>
        <Link className="createUpdDelBtn" to={`/Tasks/${props.task.id}`} state={{projectId: props.task.projectId}}>SubTasks</Link>
      </MyButton>}
      {!props.task.isSubtask &&
        <MyButton>
          <Link className="createUpdDelBtn" to={`/Comments/${props.task.id}`} state={{projectId: props.task.projectId}}>Comments</Link>
        </MyButton>}
      <form onSubmit={handleUpload} className='uploadUrl' >
          <MyInput type="file" className='uploadFile' style={{width: 500, marginBottom: 10}}/>
          <MyButton type='submit' style={{width: 120}}>Upload</MyButton>
        </form>
      </div>
  );
};

export default TaskItem;