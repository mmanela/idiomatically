import * as React from "react";
import { Modal } from "antd";
import { Redirect } from "react-router";
import { OperationStatus } from "../__generated__/types";

const pendingStatusConent: string = `Thanks for suggesting the change, we will review it shortly.`;
const failureToPendStatusConent: string = `You have too many changes pending approval. Please try again later.`;
function getContent(secondsToGo: number, operationStatus: OperationStatus) {
  return (
    <>
      <div>{operationStatus === OperationStatus.PENDING ? pendingStatusConent : failureToPendStatusConent}</div>
      <div>{`You will be redirected after ${secondsToGo} second.`}</div>
    </>
  );
}

function launchModal(
  setDone: React.Dispatch<React.SetStateAction<boolean>>,
  secondsToGo: number,
  operationStatus: OperationStatus
) {
  const close = () => {
    clearInterval(timer);
    modal.destroy();
    setDone(true);
  };

  const modal = Modal.success({
    title: operationStatus === OperationStatus.PENDING ? "Idiom change proposal received!" : "Sorry, too many pending proposals.",
    content: getContent(secondsToGo, operationStatus),
    onOk: () => {
      close();
    }
  });

  const timer = setInterval(() => {
    secondsToGo -= 1;
    modal.update({
      content: getContent(secondsToGo, operationStatus)
    });
  }, 1000);
  setTimeout(() => {
    close();
  }, secondsToGo * 1000);
}

export interface PendingOperationNotificationProps {
  redirect: string;
  delay?: number;
  operationStatus: OperationStatus;
}

export const PendingOperationNotification: React.FunctionComponent<PendingOperationNotificationProps> = props => {
  const [done, setDone] = React.useState(false);
  if (!done) {
    launchModal(setDone, props.delay || 10, props.operationStatus);
  } else {
    return <Redirect to={props.redirect} />;
  }
  return <></>;
};
