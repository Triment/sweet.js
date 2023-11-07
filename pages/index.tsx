import { render } from "preact";

function Component(props: { message: string }) {
  return (
    <body>
      <h1 onClick={()=>{
        alert("hello")
      }} style={{ color: "red" }}>{props.message}</h1>
    </body>
  );
}
render(<Component message="Hello world!" />, document.body)
document.getElementById