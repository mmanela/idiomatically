import * as React from "react";
import { Modal } from "antd";
import { Redirect } from "react-router";

const content: string = `Thanks for suggesting the change. We will review it and if all looks good, it will be published.`;
function getContent(secondsToGo: number) {
  return (
    <>
      <div>{content}</div>
      <div>{`You will be redirected after ${secondsToGo} second.`}</div>
    </>
  );
}

function launchModal(setDone: React.Dispatch<React.SetStateAction<boolean>>, secondsToGo: number) {
  const close = () => {
    clearInterval(timer);
    modal.destroy();
    setDone(true);
  };

  const modal = Modal.success({
    title: "Idiom change proposal received!",
    content: getContent(secondsToGo),
    onOk: () => {
      close();
    }
  });

  const timer = setInterval(() => {
    secondsToGo -= 1;
    modal.update({
      content: getContent(secondsToGo)
    });
  }, 1000);
  setTimeout(() => {
    close();
  }, secondsToGo * 1000);
}

export interface PendingOperationNotificationProps {
  redirect: string;
  delay?: number;
}

export const PendingOperationNotification: React.StatelessComponent<PendingOperationNotificationProps> = props => {
  const [done, setDone] = React.useState(false);
  if (!done) {
    launchModal(setDone, props.delay || 5);
  } else {
    return <Redirect to={props.redirect} />;
  }
  return <></>;
};
