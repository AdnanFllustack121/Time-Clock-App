import React, { useCallback, useEffect, useState } from 'react';
import { Page, Card, Button, Text, Icon, SkeletonDisplayText, SkeletonBodyText } from '@shopify/polaris';
import { ClockIcon } from '@shopify/polaris-icons';
import moment from 'moment';
import './css/EmployeeClockInOut.css'
import ModalComponent from '../ModalComponent';
import { useSnapshot } from 'valtio';
import { store } from '../../valtio/store';
import { showToast } from '../Toast';
import TodaysClockTable from './TodaysClockTable';

function EmployeeClockInOut() {
  const [clockedIn, setClockedIn] = useState(false);
  const [currentTime, setCurrentTime] = useState(moment().format('HH:mm:ss'));
  const [currentDate, setCurrentDate] = useState(moment().format('MMM DD, YYYY'));
  const [openNoteModal, setOpenNoteModal] = useState({
    isOpen: false,
    type: ''
  })
  const [note, setNote] = useState("")
  const [isLoadingButton, setLoadingButton] = useState(false)
  const [isLoadingClockInCard, setLoadingClockInCard] = useState(false)
  const [todaysAttendance, setTodaysAttendance] = useState([])
  const [editNoteId, setEditNoteId] = useState('')
  const snap = useSnapshot(store)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment().format('HH:mm:ss'));
      setCurrentDate(moment().format('MMM DD, YYYY'))
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoadingClockInCard(true)
      try {

        const response = await fetch(`/api/getAttendance/${snap.user.email}/${new Date()}/${false}/${false}/${false}`, {
          method: 'get',
          headers: {
            "Content-Type": "application/json",
          }
        })

        if (response.ok) {
          const { message, attendanceData } = await response.json()
          console.log('data from getAttendance', attendanceData);
          const isClockedOutLast = attendanceData[attendanceData?.length - 1]?.out_time
          console.log('isClockedInLast', isClockedOutLast);
          isClockedOutLast === null && setClockedIn(true)
          setTodaysAttendance(attendanceData)

        }

      } catch (error) {
        console.log('error', error);
      } finally {
        setLoadingClockInCard(false)
      }
    }
    fetchAttendance()
  }, [])

  const handleClockIn = useCallback(async () => {
    setLoadingButton(true)

    const apiData = {
      in_time: new Date(),
      email: snap.user.email,
      status: 'incomplete',

    }
    console.log('in-time apiData', apiData);


    try {
      const response = await fetch('/api/attendance', {
        method: 'post',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData)
      })

      if (response.ok) {
        const { message, attendanceData } = await response.json()
        console.log('response of clockin.......', attendanceData);
        setTodaysAttendance(prevAttendance => [...prevAttendance, attendanceData]);
        setClockedIn(true);
        showToast(message)

      }

    } catch (error) {
      console.log('error on clockIn', error);
    } finally {
      setLoadingButton(false)
    }


    //button effect but not working due to tone I have set in Button
    // const clockInButton = document.getElementById('clockInButton')
    // clockInButton.classList.add('clock-in-effect');
    // setTimeout(() => {
    //   clockInButton.classList.remove('clock-in-effect');
    // }, 1000);
  }, [])

  const handleClockOut = useCallback(async () => {
    toggleReasonModal()
    setLoadingButton(true)
    let idToUpdate = todaysAttendance[todaysAttendance.length - 1]?._id

    const apiData = {
      out_time: new Date(),
      email: snap.user.email,
      status: "complete",
      note: note,
      idToUpdate
    }
    console.log('out-time apiData', apiData);

    try {
      const response = await fetch('/api/attendance', {
        method: 'post',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData)
      })

      if (response.ok) {
        const { message, attendanceData } = await response.json()
        console.log('response of clockout.......', attendanceData);

        setClockedIn(true);
        showToast(message)

        setTodaysAttendance(prevAttendance =>
          prevAttendance.map(d =>
            d._id === idToUpdate ? { ...d, note: attendanceData.note, out_time: attendanceData.out_time } : d
          )
        );


      }

    } catch (error) {
      console.log('error on clockIn', error);
    } finally {
      setNote("")
      setLoadingButton(false)
    }

    setClockedIn(false);

    //button effect but not working due to tone I have set in Button
    // const clockOutButton = document.getElementById('clockOutButton')
    // clockOutButton.classList.add('clock-out-effect');
    // setTimeout(() => {
    //   clockOutButton.classList.remove('clock-out-effect');
    // }, 1000);
  }, [note, todaysAttendance])

  const handleViewNote = (id, noteToView) => {
    setOpenNoteModal({
      isOpen: true,
      type: 'editing'
    })
    setEditNoteId(id)
    setNote(noteToView)
  }

  const toggleReasonModal = () => {
    openNoteModal.isOpen && setNote('')
    setOpenNoteModal((prev) => ({
      isOpen: !prev.isOpen,
      type: prev.isOpen ? '' : 'adding'
    }))
  }

  const handleEditNote = async () => {
    setOpenNoteModal({
      isOpen: false,
      type: ''
    })

    try {

      const apiData = {
        note,
        idToUpdate: editNoteId
      }

      const response = await fetch('/api/editNote', {
        method: 'post',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData)
      })

      if (response.ok) {
        const { message, attendanceData } = await response.json()
        setTodaysAttendance(prevAttendance =>
          prevAttendance.map(d =>
            d._id === editNoteId ? { ...d, note: attendanceData.note } : d
          )
        );
        showToast(message)

      }

    } catch (error) {
      console.log('error from handleEditNote', error);

    } finally {
      setEditNoteId('')
      setNote("")

    }
  }

  const clockStartedTime = todaysAttendance[todaysAttendance?.length - 1]?.out_time ?
    false : todaysAttendance[todaysAttendance.length - 1]?.in_time?.split(' ')[1]

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center' }} >
        <Text variant="headingXl" as="h4" >
          <span className='headingTextColor'>Clock-in/Clock-out</span>
        </Text>
      </div>
      <div className="card-container">
        <div className="card" style={{borderRadius:'40px'}}>
          {
            isLoadingClockInCard
              ?
              <>
                <SkeletonBodyText lines={3} />
                <div className='skeleton-mid'>
                  <SkeletonDisplayText size="medium" />

                </div>
                <SkeletonBodyText lines={1} />
              </>

              :
              <div className="content-center">
                <Text variant="headingLg" as="h5">
                  {currentDate}
                </Text>
                <div className="spacing-dateAndTime" ></div>
                <Text variant="headingLg" as="h5">
                  {currentTime}
                </Text>
                <div className="button-wrapper">
                  {!clockedIn ? (
                    <Button
                      id="clockInButton"
                      primary
                      onClick={handleClockIn}
                      size="large"
                      icon={<Icon source={ClockIcon} />}
                      tone='success'
                      loading={isLoadingButton}
                    >
                      <p className='clockin-out-text'>
                        Clock In
                      </p>

                    </Button>
                  ) : (
                    <Button
                      id="clockOutButton"
                      destructive
                      onClick={toggleReasonModal}
                      size="large"
                      icon={<Icon source={ClockIcon} />}
                      tone='critical'
                      loading={isLoadingButton}
                    >
                      <p className='clockin-out-text'>
                        Clock Out
                      </p>
                    </Button>
                  )}
                </div>
                <div className="spacing-clock-startedTime" ></div>

                <Text variant="headingSm" as="h6">
                  {clockStartedTime ? `Clock started at : ${clockStartedTime}` : 'Currently you are clocked-out'}
                </Text>
              </div>
          }


        </div>


      </div>
      <div className='clockTableHeading'>
        <Text variant="headingXl" as="h4">
          <span className='headingTextColor'>Today's clock-in and clock-out records</span>
        </Text>
      </div>
      <div className='table-container'>

        <div className='card-table'>
          <section>
            <TodaysClockTable
              todaysAttendance={todaysAttendance}
              isLoadingClockInCard={isLoadingClockInCard}
              handleViewNote={handleViewNote}
            />
          </section>
        </div>
      </div>




      <ModalComponent
        isTrue={openNoteModal.isOpen}
        toggleModal={toggleReasonModal}
        handlePrimaryAction={openNoteModal.type === 'adding' ? handleClockOut : handleEditNote}
        type={"reason"}
        primaryContent={"Save"}
        secondaryContent={"Cancel"}
        sectionContent={openNoteModal.type === 'adding' ? "Please add a note." : "You can update note here."}
        value={note}
        setValue={setNote}
      />
    </>


  );
}

export default EmployeeClockInOut;
