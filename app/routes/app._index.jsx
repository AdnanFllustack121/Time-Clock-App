import { useEffect, useState } from "react";
import { verifyUser } from "../components/authentications/verifyUser";
import Loader from "../components/Loader";
import { useNavigate } from "@remix-run/react";
import { store } from "../valtio/store";
import { useSnapshot } from "valtio";
import Header from "../components/Header";
import EmployeeClockInOut from "../components/TimeClock/EmployeeClockInOut";

export default function Index() {
  const snap = useSnapshot(store)
  const navigate = useNavigate();
  const [isVerified, setVerified] = useState(false)

  useEffect(() => {

    async function doVerification() {
      const isVerified = await verifyUser();
      if (!isVerified) {
        navigate("/app/login");
      } else {
        setVerified(true);
      }
    }

    if (snap.user.email.length > 2) {
      setVerified(true)
    } else {
      doVerification();
    }
  }, [navigate]);

  return (
    <>
      {!isVerified ? <Loader /> :
        <Header
          title={"Time Clock"}
          component={
            <EmployeeClockInOut />
          }
        />
      }
    </>

  );
}
