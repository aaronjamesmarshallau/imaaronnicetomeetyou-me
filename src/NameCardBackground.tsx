import { FunctionComponent } from "react";
import './NameCardBackground.css';

export const NameCardBackground: FunctionComponent = () => {
  return (
    <div className="name-card-background">
      <div className="shape-blob"></div>
      <div className="shape-blob one"></div>
      <div className="shape-blob two"></div>
      <div className="shape-blob three"></div>
      <div className="shape-blob four"></div>
      <div className="shape-blob five"></div>
      <div className="shape-blob six"></div>
    </div>
  );
};