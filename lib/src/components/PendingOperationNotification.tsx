import { Modal } from "antd";
import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { OperationStatus } from "../__generated__/types";

const pendingContent =
  "Thanks for suggesting the change, we will review it shortly.";
const failureContent =
  "You have too many changes pending approval. Please try again later.";

function getContent(secondsToGo: number, operationStatus: OperationStatus) {
  return (
    <>
      <div>
        {operationStatus === OperationStatus.PENDING
          ? pendingContent
          : failureContent}
      </div>
      <div>{`You will be redirected after ${secondsToGo} second.`}</div>
    </>
  );
}

export interface PendingOperationNotificationProps {
  redirect: string;
  delay?: number;
  operationStatus: OperationStatus;
}

export function PendingOperationNotification(
  props: PendingOperationNotificationProps,
) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    let secondsToGo = props.delay || 10;
    let closed = false;
    const close = () => {
      if (closed) {
        return;
      }
      closed = true;
      clearInterval(timer);
      clearTimeout(timeout);
      modal.destroy();
      setDone(true);
    };
    const modal = Modal.success({
      title:
        props.operationStatus === OperationStatus.PENDING
          ? "Idiom change proposal received!"
          : "Sorry, too many pending proposals.",
      content: getContent(secondsToGo, props.operationStatus),
      onOk: close,
    });
    const timer = setInterval(() => {
      secondsToGo -= 1;
      modal.update({
        content: getContent(secondsToGo, props.operationStatus),
      });
    }, 1_000);
    const timeout = setTimeout(close, secondsToGo * 1_000);

    return () => {
      closed = true;
      clearInterval(timer);
      clearTimeout(timeout);
      modal.destroy();
    };
  }, [props.delay, props.operationStatus]);

  return done ? <Navigate to={props.redirect} replace /> : null;
}
