"use strict";
import {initShaderProgram, loadTexture} from './openGLfuncs';
import {vsSource, fsSource} from './shaders';
import {initMesh} from './objs'
import {sphere} from "./sphere";
import {model} from "./model";
import Collision2D from "./collision";
import {platform} from "./platform";
import {mushrooms} from "./mushrooms";

import Ant from "./antMapCreator";
import {cubeDefualt} from "./cube";

let buffers;
let angleRotateCar = 0.0;
let zCarPos = 0.0, xCarPos = 0.0;
let zLightPos = 0.0, xLightPos = 0.0;
let currentPose = [[1.0,0.0,0.0],[1.0,0.0,0.0],[-1.0,0.0,1.0]];
let canLight2 = 1;
let carLight = 1.0;
let sunLight = 1.0;
let aX =0.0;
let aY=3.1;
let GameObject = [];
let CarGameObject;
let playerPos = {x:0.0, y:0.0, z:0.0};

const OBJ = require('webgl-obj-loader');

window.onload = function main() {
    const canvas = document.querySelector("#gl_canvas");
    const gl = canvas.getContext("webgl2");// Получаем контекст webgl2
    const drawCanvas = document.querySelector("#map_canvas");
    const drawMapContext = drawCanvas.getContext("2d");

    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");// Обработка ошибок
        return;
    }
    
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);// Устанавливаем размер вьюпорта
    gl.enable(gl.DEPTH_TEST);// Включаем z-buffer
    
    const programInfo = initProgramInfo(gl);

    //CreateGameObject
    CarGameObject = new Collision2D(0.0,0.0,0.11);
    GameObject[0] = new Collision2D(currentPose[1][0],currentPose[1][2],0.05);
    GameObject[1] = new Collision2D(currentPose[2][0],currentPose[2][2],0.05);
    buffers = [initMesh(gl,new OBJ.Mesh(sphere),[0.7,0.1,0.6,1.0],"texture.png"),//0
        initMesh(gl, new OBJ.Mesh(model),[0.2,0.3,0.7,1.0]),//1
        initMesh(gl, new OBJ.Mesh(cubeDefualt),[1.0,1.0,1.0,1.0]),//2
        initMesh(gl, new OBJ.Mesh(mushrooms),[0.2,0.0,0.7,1.0]),//3
        // initMesh(gl, new OBJ.Mesh(cubeDefualt),[1.0,1.0,1.0,1.0]),//4
        // initMesh(gl, new OBJ.Mesh(cubeDefualt),[1.0,1.0,1.0,1.0]),//5
        // initMesh(gl, new OBJ.Mesh(cubeDefualt),[1.0,1.0,1.0,1.0]),//6
        // initMesh(gl, new OBJ.Mesh(cubeDefualt),[1.0,1.0,1.0,1.0]),//7
    ];// Инициализируем буфер
   //SetStartPosition

    buffers[0].setTranslateScale([0.0,0.0,0],[0.1,0.1,0.1],angleRotateCar);
    buffers[1].setTranslateScale(currentPose[1],[0.1,0.1,0.1],0);
    buffers[2].setTranslateScale([0.0,0.0,0.0],[1.0,1.0,1.0],0);
    buffers[3].setTranslateScale(currentPose[2],[0.01,0.01,0.01],0);
    // buffers[4].setTranslateScale([1.0,0.0,0.0],[1.0,1.0,1.0],0);
    // buffers[5].setTranslateScale([2.0,0.0,0.0],[1.0,1.0,1.0],0);
    // buffers[6].setTranslateScale([3.0,0.0,0.0],[1.0,1.0,1.0],0);
    // buffers[7].setTranslateScale([4.0,0.0,0.0],[1.0,1.0,1.0],0);

    //Ant
    let map = new Ant(10,100,100,Math.random()*300);
    let mapa = map.move();
    map.setLandSize(Math.random()*400);
    mapa = map.move();
    map.setLandSize(Math.random()*500);
    mapa = map.move();
    drawMapContext.lineWidth = 1;
    for(let i = 0; i<mapa.length;i++)
    {
        for(let j = 0; j<mapa[i].length;j++)
        {
            if(mapa[i][j]==0)
            {
                drawMapContext.strokeStyle = "rgb(0,0,0)";
            }
            else{
                drawMapContext.strokeStyle = "rgb(25,255,0)";
                //buffers.push(initMesh(gl, new OBJ.Mesh(cubeDefualt),[1.0,1.0,1.0,1.0]))
            }
            drawMapContext.beginPath();
            drawMapContext.moveTo(i,j);
            drawMapContext.lineTo(i+1,j+1);
            drawMapContext.stroke();
        }
    }
    //
    window.onkeydown = (e) => {
        drawScene(gl, programInfo, buffers);
    }
    drawScene(gl, programInfo, buffers);
}


function initProgramInfo(gl) {
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);// Создаём шейдерную программу
    return {
        program: shaderProgram,// Сама программа
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'avertexPosition'),
            normalPosition: gl.getAttribLocation(shaderProgram, 'anormalPosition'),
            textureCoords: gl.getAttribLocation(shaderProgram, 'textureCoords'),
        },
        uniformLocations: {
            color: gl.getUniformLocation(shaderProgram, 'uColor'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            viewMatrix: gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
            //light
            lightPosition: gl.getUniformLocation(shaderProgram, 'light.position'),//!!!!!!!!!!!!!!!!!!!!direction
            lightAmbient: gl.getUniformLocation(shaderProgram, 'light.ambient'),
            lightDiffuse: gl.getUniformLocation(shaderProgram, 'light.diffuse'),
            lightSpecular: gl.getUniformLocation(shaderProgram, 'light.specular'),
            //light2
            lightPosition2: gl.getUniformLocation(shaderProgram, 'light2.position'),//!!!!!!!!!!!!!!!!!!!!direction
            lightAmbient2: gl.getUniformLocation(shaderProgram, 'light2.ambient'),
            lightDiffuse2: gl.getUniformLocation(shaderProgram, 'light2.diffuse'),
            lightSpecular2: gl.getUniformLocation(shaderProgram, 'light2.specular'),
            lightOn2: gl.getUniformLocation(shaderProgram, 'light2.on'),
            //SpotLight
            lightDirSpot: gl.getUniformLocation(shaderProgram, `spotLight.direction`),
            lightAttenSpot: gl.getUniformLocation(shaderProgram,`spotLight.attenuation`),
            lightSpecSpot: gl.getUniformLocation(shaderProgram,`spotLight.specular`),
            lightDiffSpot: gl.getUniformLocation(shaderProgram,`spotLight.diffuse`),
            lightAmbientSpot: gl.getUniformLocation(shaderProgram,`spotLight.ambient`),
            lightPosSpot: gl.getUniformLocation(shaderProgram,`spotLight.position`),
            lightExpSpot: gl.getUniformLocation(shaderProgram,`spotLight.exp`),
            lightCutSpot: gl.getUniformLocation(shaderProgram,`spotLight.cutoff`),
            //Sunwell
            sunLightPosition: gl.getUniformLocation(shaderProgram,'light3.position'),
            sunLightAmbient: gl.getUniformLocation(shaderProgram,'light3.ambient'),
            sunLightDiffuse: gl.getUniformLocation(shaderProgram,'light3.diffuse'),
            sunLightSpecular: gl.getUniformLocation(shaderProgram,'light3.specular'),
            sunLightDirection: gl.getUniformLocation(shaderProgram,'light3.direction'),
            sunLightOn: gl.getUniformLocation(shaderProgram,'light3.on'),
            //params
            viewPosition: gl.getUniformLocation(shaderProgram, 'params.viewPosition'),//4 3 3
            uSampler: gl.getUniformLocation(shaderProgram,'uSampler'),
            //currentPosition
            currentPos: gl.getUniformLocation(shaderProgram,'currentPos'),
            //CarPos
            carPosition: gl.getUniformLocation(shaderProgram,`carLight.carPosition`),
            carLight: gl.getUniformLocation(shaderProgram,`carLight.carLight`),
            //
            //tmpLightRotate
            tLX: gl.getUniformLocation(shaderProgram,'tmpX'),
            tLY: gl.getUniformLocation(shaderProgram,'tmpY'),
            //camPos
            cameraPos: gl.getUniformLocation(shaderProgram,'camPos'),
        },
        textures: {
            textureMaterial: loadTexture(gl, document.getElementById("orange").src),
            textureMaterial2: loadTexture(gl,document.getElementById("carTexture").src),
            textureMaterial3: loadTexture(gl, document.getElementById("groundTexture").src),
            textureMaterial4: loadTexture(gl, document.getElementById("tree").src),
        }
    };
}


function setupLights(gl, {uniformLocations}) {
    gl.uniform3fv(uniformLocations.lightPosition, [0.5, -10.0, 22.0]);//0.5, 1.2, 2.0
    gl.uniform3fv(uniformLocations.lightAmbient, [0.2, 0.1, 0.0]);//vec3(0.1)
    gl.uniform3fv(uniformLocations.lightDiffuse, [0.1, 0.1, 0.1]);//0.7 0.7 0.7 1.0
    gl.uniform3fv(uniformLocations.lightSpecular, [0.5, 0.5, 0.5]);// 1.0 1.0 1.0

    gl.uniform1f(uniformLocations.lightOn2,canLight2);
    gl.uniform3fv(uniformLocations.lightPosition2, [0.0, -10.0, 0.0]);
    gl.uniform3fv(uniformLocations.lightAmbient2, [0.2, 0.1, 0.0]);
    gl.uniform3fv(uniformLocations.lightDiffuse2, [0.1, 0.1, 0.1]);
    gl.uniform3fv(uniformLocations.lightSpecular2, [0.5, 0.5, 0.5]);

    gl.uniform4fv(uniformLocations.lightPosSpot,[0.0,0.0,0.0,0.0]);
    gl.uniform4fv(uniformLocations.lightAmbientSpot,[0.1, 0.1, 0.1, 1.0]);
    gl.uniform4fv(uniformLocations.lightDiffSpot,[2.7, 2.7, 2.7, 1.0]);
    gl.uniform4fv(uniformLocations.lightSpecSpot,[1.0, 1.0, 1.0, 1.0]);
    gl.uniform3fv(uniformLocations.lightAttenSpot,[0.7, 0.7, 0.7]);
    gl.uniform3fv(uniformLocations.lightDirSpot,[0.0, 0.0, 0.0]);
    gl.uniform1f(uniformLocations.lightCutSpot,1);
    gl.uniform1f(uniformLocations.lightExpSpot,1);

    gl.uniform3fv(uniformLocations.sunLightPosition,[0.0,10.0,0.0]);
    gl.uniform3fv(uniformLocations.sunLightAmbient,[0.7,0.7,0.7]);
    gl.uniform3fv(uniformLocations.sunLightDiffuse,[0.7,0.7,0.7]);
    gl.uniform3fv(uniformLocations.sunLightSpecular,[1.0,1.0,1.0]);
    gl.uniform1f(uniformLocations.sunLightOn,sunLight);
    //gl.uniform3fv(uniformLocations.sunLightDirection)


    gl.uniform3fv(uniformLocations.viewPosition, [4.0, 3.0, 3.0]);
}

function setupCarLight(gl,{uniformLocations},carLightPos)
{

}

function drawScene(gl, programInfo, buffers) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);// Чистим экран
    gl.clearDepth(1.0);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //Camera
    gl.uniform4fv(programInfo.uniformLocations.cameraPos, [playerPos.x,0.0,playerPos.z,1.0,])
    console.log("cam");
    //

    gl.useProgram(programInfo.program);// Устанавливаем используемую программу
    setupLights(gl,programInfo);
    const fieldOfView = 1.0;   // in radians
    let projectionMatrix = mat4.create();
    let pMj;
    mat4.perspective(projectionMatrix, fieldOfView,  gl.canvas.clientWidth / gl.canvas.clientHeight, 0.1, 100.0);
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, programInfo.textures.textureMaterial2);
    gl.uniform1i(programInfo.uniformLocations.uSampler, 1);

    buffers[0].setTranslateScale([xCarPos,0.0,zCarPos],[0.1,0.1,0.1],angleRotateCar, "texture.png");
    buffers[0].draw(gl, programInfo);
    let carXY = CarGameObject.getLightXY();
    gl.uniform3fv(programInfo.uniformLocations.carPosition,[carXY[1],0.0,carXY[0]]);
    //console.log(carXY);
    console.log([xCarPos,zCarPos]);
    gl.uniform1f(programInfo.uniformLocations.carLight,carLight);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, programInfo.textures.textureMaterial);
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
    buffers[1].setTranslateScale(currentPose[1],[0.5,0.5,0.5],0.0);
    buffers[1].draw(gl, programInfo);

    gl.activeTexture(gl.TEXTURE2);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);
    gl.bindTexture(gl.TEXTURE_2D, programInfo.textures.textureMaterial3);

    //TMP platform
    gl.uniform3fv(programInfo.uniformLocations.tLY, [-angleRotateCar+3.1,aX,0.0]);

    gl.uniform1i(programInfo.uniformLocations.uSampler, 2);
    buffers[2].setTranslateScale([0.0,-1.0,0.0],[0.5,0.5,0.5],0.0);
    buffers[2].draw(gl, programInfo);

    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, programInfo.textures.textureMaterial4);
    gl.uniform1i(programInfo.uniformLocations.uSampler, 3);
    buffers[3].setTranslateScale(currentPose[2],[0.1,0.1,0.1],0.0);
    buffers[3].draw(gl, programInfo);
    for(let i = 4; i <buffers.length;i++)
    {
        gl.uniform1i(programInfo.uniformLocations.uSampler, 2);
        buffers[i].setTranslateScale([i-3,0.0,0.0],[0.5,0.5,0.5],0.0);
        buffers[i].draw(gl, programInfo);
    }
}

addEventListener("keydown", alertKey);

function CanMove(car)
{
    let can = true;
    GameObject.forEach(object => {
        if(car.intersects(object)){
            console.log("eeeeeeeee");
            //alert("СКРИМЕР АААААААА!");
            document.getElementById("sound").play();
            can = false;
            return;
        }
    })
    return can;
}

function alertKey(e) {
    let futureCar = new Collision2D(CarGameObject.x,CarGameObject.y,CarGameObject.r);
   if(e.key == "ArrowLeft") {
       futureCar.y += 0.05*Math.cos(angleRotateCar+ 0.035);
       futureCar.x += -0.05*Math.sin(angleRotateCar+0.035);
       if (CanMove(futureCar)) {
           angleRotateCar += 0.035;
           xCarPos += 0.05 * Math.cos(angleRotateCar);
           zCarPos += -0.05 * Math.sin(angleRotateCar);
       }
   }
   if(e.key == "ArrowRight") {
       futureCar.y += 0.05*Math.cos(angleRotateCar-0.035);
       futureCar.x += -0.05*Math.sin(angleRotateCar-0.035);
       if (CanMove(futureCar)) {
           angleRotateCar -= 0.035;
           xCarPos += 0.05 * Math.cos(angleRotateCar);
           zCarPos += -0.05 * Math.sin(angleRotateCar);
       }
   }
    if(e.key == "ArrowUp") {
        futureCar.y += 0.05*Math.cos(angleRotateCar);
        futureCar.x += -0.05*Math.sin(angleRotateCar);
        if(CanMove(futureCar)) {
            xCarPos += 0.05 * Math.cos(angleRotateCar);
            zCarPos += -0.05 * Math.sin(angleRotateCar);
        }
    }
    if(e.key == "ArrowDown") {
        futureCar.y -= 0.05*Math.cos(angleRotateCar);
        futureCar.x -= -0.05*Math.sin(angleRotateCar);
        if(CanMove(futureCar)) {
            xCarPos -= 0.05 * Math.cos(angleRotateCar);
            zCarPos -= -0.05 * Math.sin(angleRotateCar);
        }
    }
    if(e.key == "L") {
        if (canLight2 > 0) {
            canLight2 = 0;
        } else {
            canLight2 = 1;
        }
        console.log(canLight2);
    }
    if(e.key=="O")
    {
        if (sunLight > 0.0) {
            sunLight = 0.0;
        } else {
            sunLight = 1.0;
        }
    }

    if(e.key =="K")
    {
        if (carLight > 0.0) {
            carLight = 0.0;
        } else {
            carLight = 1.0;
        }
    }
    if(e.key =="w")
    {
        playerPos.x+=0.1;
    }
    if(e.key =="s")
    {
        playerPos.x-=0.1;
    }
    if(e.key =="a")
    {
        playerPos.z-=0.1;
    }
    if(e.key =="d")
    {
        playerPos.z+=0.1;
    }
    xLightPos = futureCar.y;
    zLightPos = futureCar.x;
    CarGameObject.updateCurrentCoords(zCarPos,xCarPos);
    CarGameObject.rotateLight(angleRotateCar);

}