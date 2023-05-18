import { render } from "preact";
import { App } from "./app";

const theme = localStorage.getItem("theme");
const root = document.querySelector("html") as HTMLHtmlElement;

if (theme === "light") {
  root.classList.add("light");
} else {
  root.classList.remove("light");
}

render(<App />, document.getElementById("app") as HTMLElement);
