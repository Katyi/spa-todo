import React, { useState, useEffect } from "react";
import { query, collection, onSnapshot, doc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import ProjectItem from "../components/ProjectItem";
import MyButton from "../components/UI/button/MyButton";
import ProjectForm from "../components/ProjectForm";
import MyModal from "../components/UI/modal/MyModal";


function Projects() {
  const [projects, setProjects] = useState([]);
  let [modal, setModal] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'projects'))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let projectsArr = [];
      querySnapshot.forEach((doc) => {
        projectsArr.push({ ...doc.data(), id: doc.id })
      })
      setProjects(projectsArr)
    })
    return () => unsubscribe()
  }, []);
  
  // const createProject = async (input) => {
  //   if (e === undefined) { return }
  //   e.preventDefault();
  //   if (input === '') {
  //     alert('input some input')
  //     return
  //   }
  //   await addDoc(collection(db, 'projects'), {
  //     description: input,
  //     completed: false
  //   })
  // }
  
  const removeProject = async (project) => {
    await deleteDoc(doc(db, 'projects', project.id))
    console.log("DELETED project", project);
    window.location.reload();
  }


  return (
    <div className="App">
      <div className="header">
        <div className="header_part1">
          <div className="header_title">Проекты</div>
        </div>
        <div className='header_of_tasks'>
          <div className="task_id">№</div>
          <div className='task_projectName'>Проекты</div>
          <div className='task_description'>Описание</div>
        </div>
      </div>
      <div className='container'>
        <MyButton style={{ marginTop: 12, marginLeft: 30 }} onClick={() => setModal(true)}>
          Create new project
        </MyButton>
        <MyModal visible={modal} setVisible={setModal}>
          <ProjectForm/>
        </MyModal>
        <div className='projects'>
          {projects.map((project, index) => (
            <ProjectItem remove={removeProject} project={project} key={index} num={index + 1} />
          ))}
        </div>
      </div>
    </div>
  )
};

export default Projects;