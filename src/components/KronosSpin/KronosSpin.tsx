import {Spin} from "antd";

const KronosSymbol = (props:any) => (
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
         viewBox="0 0 57.2 69.6" {...props} style={{animation: "spin 2s linear infinite"}}>
        <path style={{fill: "#50D890"}} d="M0,33.1L33.1,0l6,6.1l-26.7,27l15.5,15.5l-12.7-0.3L0,33.1z"/>
        <path style={{fill: "#50D890"}} d="M57.2,36.5L24.1,69.6l-6-6.1l26.7-27L29.4,21l12.7,0.3L57.2,36.5z"/>
    </svg>
);

export default function KronosSpin(props: any) {
    return (<Spin indicator={<KronosSymbol/>} size="large"/>);
}
