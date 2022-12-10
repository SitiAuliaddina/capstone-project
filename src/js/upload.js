import "../assets/style/style.css";
import './component/header-bar.js'
import './component/footer-bar.js'
import './component/upload/instruction-section.js'


import fruit from "../assets/images/pineapple.jpg";
import number1 from "../assets/images/number1.png";
import number2 from "../assets/images/number2.png";
import number3 from "../assets/images/number3.png";
import number4 from "../assets/images/number4.png";
import * as tf from "@tensorflow/tfjs";
import { NonMaxSuppressionV3 } from "@tensorflow/tfjs";

const SESSION_KEY = "pred"
if(!sessionStorage.getItem(SESSION_KEY)){
    sessionStorage.setItem(SESSION_KEY,{})
}
const TARGET_CLASSES = {
    0: "Alpukat Mentega",
    1:"Apel Envy",
    2:"Apel Malang",
    3:"Jeruk Peras",
    4:"Jeruk Sunkist",
    5:"Kiwi Green",
    6:"Lemon California",
    7 :"Mangga Alpukat",
    8:"Mangga Harum Manis",
    9:"Naga Merah",
    10:"Pear Century",
    11:"Pisang Cavendish",
    12:"Pisang Kepok",
    13:"Salak Pondoh",
    14 : "Semangka Merah",
    15 : "Strawberry"
}

// const TARGET_CLASSES = ["satu","dua","tiga","empat","lima","enam","tujuh"]
window.addEventListener("load",()=>{
    const rightImage = document.getElementById("right-image");
    const numberone = document.getElementById("no-1");
    const numbertwo = document.getElementById("no-2");
    const numberthree = document.getElementById("no-3");
    const numberfour = document.getElementById("no-4");
    rightImage.src=fruit;
    numberone.src = number1;
    numbertwo.src = number2;
    numberthree.src = number3;
    numberfour.src = number4;
})
let model;
const init = async()=>{
    console.log("Load Model");
    model = await tf.loadLayersModel("./tfjsmodel/model.json");
    console.log("Model Loaded")
    
}

init();

const formInput = document.querySelector("#form-input");
const inputFile = document.querySelector("#input-file");
const imageInput = document.querySelector("#image-input");
const predictButton = document.querySelector(".button-start");



formInput.addEventListener("click",(e)=>{
    inputFile.click();
    e.target.addEventListener("change",async ({target})=>{
        let file = target.files[0];
        const reader = new FileReader();

        reader.addEventListener("load",()=>{
            imageInput.setAttribute("src",reader.result);

        })
        formInput.classList.add("on-predict")
        reader.readAsDataURL(file);
    })
})

predictButton.addEventListener("click",async()=>{
    const result = await predict(imageInput);
    const category = Array.from(result).map((prob, index)=>({
        probability : prob,
        className : TARGET_CLASSES[index]
    }))
    const probSorted = category.sort((a,b)=>b.probability-a.probability)
    const [topOne,topTwo,topThree] = probSorted
    sessionStorage.setItem(SESSION_KEY, JSON.stringify([topOne,topTwo,topThree,{sourceImage : imageInput.getAttribute("src")}]))
    // alert(`Mungkin adalah ${topOne.className}`)
    window.location.href = "/result.html"
})

const predict = (input)=>{
    const tensor = tf.browser.fromPixels(input).resizeNearestNeighbor([200,200]).toFloat().div(255.0).expandDims()
    const history = model.predict(tensor);
    return history.data();
}

const webcamWrapper = document.querySelector(".webcam-wrapper")
const videoElement = document.querySelector("#web-video")
const buttonCamera = document.querySelector(".camera")
const canvasElement = document.querySelector("#web-canvas")
const captureButton = document.querySelector("#capture-button")
buttonCamera.addEventListener("click",()=>{
    webcamWrapper.style.display="block"
    initCamera();
})

const initCamera = async()=>{
    try{
        const stream = await navigator.mediaDevices.getUserMedia({video: {facingMode : "user"}, audio:false})
        videoElement.srcObject = stream;
        webcamWrapper.classList.add("stream")
    }catch(e){
        console.log(e)
    }
}
const snapPicture = async()=>{
    canvasElement.getContext("2d").drawImage(videoElement,0,-80,250,250);
    const imageData = canvasElement.toDataURL("image/jpeg")
    imageInput.setAttribute("src",imageData)
    formInput.classList.add("on-predict")

}

captureButton.addEventListener("click", async()=>{
    try{
        snapPicture()
        webcamWrapper.style.display="none"
    }catch(e){
        console.log(e)
    }
})

const shadowBarElement = document.querySelector("header-bar")
const eventClick = (e)=>{
    e.target.parentElement.classList.toggle("hamburger")
    let ul = e.target.parentElement.nextElementSibling 
    ul.classList.toggle("slide")
    let li = ul.querySelectorAll("li");

    li.forEach(value=>{
        value.addEventListener("click",()=>{
            ul.classList.remove("slide")
        })
    })
}
shadowBarElement.setEvent = eventClick;