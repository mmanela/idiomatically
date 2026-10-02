import { Empty } from "antd";

export default function NotFoundRoute() {
  return (
    <Empty
      className="empty404"
      image="/static/dog404.jpg"
      description="Looks like you went barking up the wrong tree."
    />
  );
}
