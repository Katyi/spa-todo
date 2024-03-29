import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router";
import { query, collection, where, getDocs, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { getStorage, ref, deleteObject } from "firebase/storage";
import { db } from '../firebase';
import MyButton from "../components/UI/button/MyButton";
import MyInput from "../components/UI/input/MyInput";
import SubTaskColumn from "../components/SubTaskColumn";
import MyNavbar from "../components/UI/Navbar/MyNavbar";
import SubTaskForm from "../components/SubTaskForm";
import MyModal from "../components/UI/modal/MyModal";
import Footer from "../components/UI/footer/Footer";

function SubTasks() {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const { projectId } = location.state;
  const [queueTasks, setQueueTasks] = useState([]);
  const [developmentTasks, setDevelopmentTasks] = useState([]);
  const [doneTasks, setDoneTasks] = useState([]);
  const [task, setTask] = useState([]);
  const [taskForSearch, setTaskForSearch] = useState('');
  const [taskForSearch1, setTaskForSearch1] = useState('');
  const [modal4, setModal4] = useState(false);
  const [errors, setErrors] = useState({});
  // const [subTasks, setSubTasks] = useState([]);
  let { id } = useParams();

  // ------ Get Task Data --------------------------------------------
  const getTask = async (id) => {
    const docRef = doc(db, 'tasks', id);
    let docSnap = await getDoc(docRef);
    setTask(docSnap.data());
  }

  // -----Параметры для отображения подзадач в трех столбцах на странице задач------------------------------------------------------------------
  async function firebaseQuery() {
    const q1 = query(collection(db, 'tasks'), where("status", "==", "Queue"), where("isSubtask", "==", true), where('taskId', '==', id));
    const q2 = query(collection(db, 'tasks'), where("status", "==", "Development"), where("isSubtask", "==", true), where('taskId', '==', id));
    const q3 = query(collection(db, 'tasks'), where("status", "==", "Done"), where("isSubtask", "==", true), where('taskId', '==', id));
    let tasksArr1 = [];
    let tasksArr2 = [];
    let tasksArr3 = [];
    const querySnapshot1 = await getDocs(q1);
    const querySnapshot2 = await getDocs(q2);
    const querySnapshot3 = await getDocs(q3);
    querySnapshot1.forEach((doc) => {
      tasksArr1.push({ ...doc.data(), id: doc.id })
    })
    querySnapshot2.forEach((doc) => {
      tasksArr2.push({ ...doc.data(), id: doc.id })
    })
    querySnapshot3.forEach((doc) => {
      tasksArr3.push({ ...doc.data(), id: doc.id })
    })
    setQueueTasks(tasksArr1)
    setDevelopmentTasks(tasksArr2)
    setDoneTasks(tasksArr3)
    setIsLoading(false)
  }

  const removeTask = async (task) => {
    const storage = getStorage();
    let tasksArr2 = [task];
    tasksArr2.forEach(async (task) => {
      if (task.hasOwnProperty('fileName')) {
        const imgRef1 = ref(storage, `files/${task.fileName}`);
        await deleteObject(imgRef1).then(() => {
          // File deleted successfully
        }).catch((error) => {
          // Uh-oh, an error occurred!
        });
      }
    })
    // delete subtask by id
    await deleteDoc(doc(db, 'tasks', task.id));
    firebaseQuery();
  }

  const handleChange = (e) => {
    setTaskForSearch(e.target.value);
  };
  const handleChange1 = (e) => {
    setTaskForSearch1(e.target.value);
  };

  const searchTask = async (queueTasks, developmentTasks, doneTasks) => {
    if (taskForSearch !== '') {
      let searchResult1 = await queueTasks.filter((elem) => elem.taskName.toLowerCase().includes(taskForSearch));
      let searchResult2 = await developmentTasks.filter((elem) => elem.taskName.toLowerCase().includes(taskForSearch));
      let searchResult3 = await doneTasks.filter((elem) => elem.taskName.toLowerCase().includes(taskForSearch));
      setQueueTasks(searchResult1);
      setDevelopmentTasks(searchResult2);
      setDoneTasks(searchResult3);
      setTaskForSearch("");
    } else if (taskForSearch1 !== '') {
      let searchResult1 = await queueTasks.filter((elem) => elem.taskNumber === +taskForSearch1);
      let searchResult2 = await developmentTasks.filter((elem) => elem.taskNumber === +taskForSearch1);
      let searchResult3 = await doneTasks.filter((elem) => elem.taskNumber === +taskForSearch1);
      setQueueTasks(searchResult1);
      setDevelopmentTasks(searchResult2);
      setDoneTasks(searchResult3);
      setTaskForSearch1("");
    }
  }

  useEffect(() => {
    setIsLoading(true);
    firebaseQuery();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    getTask(id);
  }, [id]);

  return (
    <div className="App">
      {isLoading && <div className="wrapper" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
        <h2>Loading<span className="dot">.</span><span className="dot">.</span><span className="dot">.</span></h2>
      </div>}
      {!isLoading && <div className="wrapper">
        <MyNavbar title={'SubTasks'} linkPath={`/Projects/${projectId}`} linkLabel={'Back To Tasks'} taskName={task.taskName} />
        <div className="container_main">
          <MyButton onClick={() => setModal4(true)}>
            Create SubTask
          </MyButton>
          {/* SEARCH PART */}
          <div action="" className="searchTask">
            <MyInput style={{ marginLeft: 0, width: 200 }} value={taskForSearch} type={"text"} placeholder={"Search by name"} onChange={handleChange} />
            <div className="MyInput1">
              <MyInput style={{ marginLeft: 0, width: 120 }} value={taskForSearch1} type={"number"} placeholder={"Search by number"} onChange={handleChange1} />
            </div>
            <div className="MyInput2">
              <MyButton style={{ marginLeft: 0, width: 120 }} onClick={() => searchTask(queueTasks, developmentTasks, doneTasks) } >
                Search
              </MyButton>
            </div>
            <div className="MyInput3">
              <MyButton onClick={() => firebaseQuery()} style={{ marginLeft: 0, width: 120 }}>
                Clear
              </MyButton>
            </div>
          </div>
        </div>

        {/* TABLE HEADERS */}
        <div className="container">
          <div className="header_of_tasks">SubTasks In Queue</div>
          <div className="header_of_tasks">SubTasks In Development</div>
          <div className="header_of_tasks">SubTasks Completed</div>
        </div>
        <div className="container">
          <div className="header_Queue_mobile">SubTasks In Queue</div>
          <SubTaskColumn name="Queue" tasks={queueTasks} removeTask={removeTask} firebaseQuery={firebaseQuery} class='container_1' setErrors={setErrors} />
          <div className="header_Development_mobile">SubTasks In Development</div>
          <SubTaskColumn name="Development" tasks={developmentTasks} removeTask={removeTask} firebaseQuery={firebaseQuery} class='container_1' setErrors={setErrors} />
          <div className="header_Done_mobile">SubTasks Completed</div>
          <SubTaskColumn name="Done" tasks={doneTasks} removeTask={removeTask} firebaseQuery={firebaseQuery} class='container_1' setErrors={setErrors} />
        </div>

        {/* MODAL FOR CREATE SUBTASK */}
        <MyModal visible={modal4} setVisible={setModal4} setErrors={setErrors}>
          <SubTaskForm
            modal={modal4}
            setModal={setModal4}
            tasks={queueTasks.concat(developmentTasks).concat(doneTasks)}
            // setTasks={setSubTasks}
            firebaseQuery={firebaseQuery}
            errors={errors} setErrors={setErrors}
          />
        </MyModal>
      </div>}
      <Footer/>
    </div>
  )
};

export default SubTasks;