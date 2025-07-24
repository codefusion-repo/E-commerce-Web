"use client";
// messages.tsx

//import "./messages.css";
import { useMessages } from "../../context/messages/messagesContext";
import { useMobile } from "../../context/mobile/mobileContext";
import { useSettings } from "../../context/settings/settingsContext";
import { AiFillCloseCircle } from "react-icons/ai";

export default function Messages() {
  const { device } = useMobile();
  const { messages, removeMessage } = useMessages();
  const { areMessagesActive } = useSettings();
  return (
    <>
      {areMessagesActive && messages.length > 0 && (
        <div
          className={`flex ${
            device > 1
              ? "f-width-xxxl"
              : device < 1
              ? "box-xxl-m"
              : "f-width-xl"
          } m-height-xxs j-end a-end column fixed gap-m z-index-xl f-bottom f-left padding-xs`}
        >
          {messages.map((message, index) => (
            <div
              className="flex fade-in-xs box-xxl m-height-xxs j-space base-bg second-border"
              key={index}
            >
              <div className="flex box-xl a-center j-start gap-xxs padding-l-ms padding-r-ms">
                <h3>{`${message.text}`}</h3>
                <h3>{`[${message.countdown} seg]`}</h3>
              </div>
              <div className="flex box-xs a-center j-end scale-xxs padding-t-xxs padding-b-xxs">
                <button
                  className="btn-small btn-active"
                  onClick={() => removeMessage(message.id)}
                >
                  <AiFillCloseCircle className="zoom-out-xxl" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
