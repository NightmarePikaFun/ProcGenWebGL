"use strict";
import {initShaderProgram, loadTexture} from './openGLfuncs';
import {vsSource, fsSource} from './shaders';
import {initMesh} from './objs'
import {sphere} from "../Model/sphere";
import {model} from "../Model/model";
import Collision2D from "./collision";
import {platform} from "../Model/platform";
import {mushrooms} from "../Model/mushrooms";

import Ant from "./antMapCreator";
import {cubeDefualt} from "../Model/cube";
let endGameBool = true;

let finalGameImg = new Image();
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
let speedGameObject = [];
let CarGameObject;
let playerPos = {x:0.0, y:0.0, z:0.0};
let rotateCamMatrix = [0.0,-11.0,0.0];
let wallMAtrix;
let loadPos = {x:0,y:0};
let _startingCarPosition;
let firsStart = true;
let bonusCarSpeed = 1.0;

//Bonus and endgame
let shardPos = [];
let shardActive = [];
let speedPos = [];
let speedActive = [];
let endPortalPoints = [];
let gameModelPos = [];


const OBJ = require('webgl-obj-loader');
let wallMapa = [];
window.onload = function main() {
    const mainMusic = document.getElementById("mainSound");
    mainMusic.volume = 0.1;
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
    //GameObject[0] = new Collision2D(currentPose[1][0],currentPose[1][2],0.05);
    //GameObject[1] = new Collision2D(currentPose[2][0],currentPose[2][2],0.05);
    buffers = [initMesh(gl,new OBJ.Mesh(sphere),[0.7,0.1,0.6,1.0],"texture.png"),//0
        initMesh(gl, new OBJ.Mesh(model),[0.2,0.3,0.7,1.0]),//1
        initMesh(gl, new OBJ.Mesh(cubeDefualt),[1.0,1.0,1.0,1.0]),//2
        initMesh(gl, new OBJ.Mesh(mushrooms),[0.2,0.0,0.7,1.0]),//3
    ];// Инициализируем буфер
   //SetStartPosition

    buffers[0].setTranslateScale([0.0,0.0,0],[0.1,0.1,0.1],angleRotateCar);
    buffers[1].setTranslateScale(currentPose[1],[0.1,0.1,0.1],0);
    buffers[2].setTranslateScale([0.0,0.0,0.0],[1.0,1.0,1.0],0);
    buffers[3].setTranslateScale(currentPose[2],[0.01,0.01,0.01],0);

    //Ant
    let map = new Ant(10,100,100,Math.random()*1000);
    let mapa = map.move();
    let startPos = map.getStartPosition();
    loadPos.x = startPos.x;
    loadPos.x = startPos.y;
    playerPos.x = 100+10-startPos.x;
    xCarPos = -playerPos.x+10;
    playerPos.z =  startPos.y;
    zCarPos = -playerPos.z;
    _startingCarPosition = {x:xCarPos,y:zCarPos};
    //GameObject[0] = new Collision2D(_startingCarPosition.x-2,_startingCarPosition.y,0.5);
    map.setLandSize(Math.random()*1000);
    mapa = map.move();
    map.setLandSize(Math.random()*1000);
    mapa = map.move();
    map.setLandSize(Math.random()*1000);
    mapa = map.move();
    map.setLandSize(Math.random()*1000);
    mapa = map.move();
    map.setLandSize(Math.random()*1000);
    mapa = map.move();
    map.setLandSize(Math.random()*1000);
    mapa = map.move();
    map.setLandSize(Math.random()*1000);
    mapa = map.move();
    map.createBridge();
    map.createWall();
    mapa = map.getMapWall();
    drawMapContext.lineWidth = 1;
    shardPos = map.getShardPoint();
    if(shardPos.length<=1)
    {
        location.reload()
    }
    speedPos = map.getSpeedGiftPoint();
    endPortalPoints = map.getAllStarPoint();
    console.log(shardPos.length);
    for(let i = 0; i<shardPos.length;i++)
    {
        shardActive.push(true);
        gameModelPos.push({x:-(110-shardPos[i].x)+10,y:-shardPos[i].y});
        GameObject[i] = new Collision2D(-(110-shardPos[i].x)+10,-shardPos[i].y,0.5);
        buffers.push(initMesh(gl, new OBJ.Mesh(mushrooms),[0.2,0.0,0.7,1.0]));
    }
    for(let i = 0; i<speedPos.length;i++)
    {
        speedActive.push(true);
        gameModelPos.push({x:-(110-speedPos[i].x)+10,y:-speedPos[i].y});
        speedGameObject[i] = new Collision2D(-(110-speedPos[i].x)+10,-speedPos[i].y,0.5);
        buffers.push(initMesh(gl, new OBJ.Mesh(mushrooms),[0.2,0.0,0.7,1.0]));
    }
    let number = 12;//Номер старта стен
    wallMAtrix=[];
    for(let i = 0 ; i<mapa.length;i++)
    {
        wallMAtrix[i] = []
        for(let j=0;j<mapa[i].length;j++)
        {
            if(mapa[i][j]>0)
            {
                wallMAtrix[i][j]=number;
                number++;
            }
            else{
                wallMAtrix[i][j]=0;
            }
        }
    }

    for(let i = 0; i<mapa.length;i++)
    {
        for(let j = 0; j<mapa[i].length;j++)
        {
            if(mapa[i][j]==0)
            {
                drawMapContext.strokeStyle = "rgb(0,0,0)";
            }
            else {
                drawMapContext.strokeStyle = "rgb(78,180,68)";
                //number++;
                buffers.push(initMesh(gl, new OBJ.Mesh(cubeDefualt),[1.0,1.0,1.0,1.0]));
                buffers[buffers.length-1].setTranslateScale([-mapa.length+i+1,0.5,-j],[0.5,0.5,0.5],0);
            }
            drawMapContext.beginPath();
            drawMapContext.moveTo(j,i);
            drawMapContext.lineTo(j+1,i+1);
            drawMapContext.stroke();
        }
    }
    buffers.push(initMesh(gl, new OBJ.Mesh(cubeDefualt),[1.0,1.0,1.0,1.0]));
    buffers[buffers.length-1].setTranslateScale([-50,0.5,1.0],[50.0,0.5,0.5],0);
    buffers.push(initMesh(gl, new OBJ.Mesh(cubeDefualt),[1.0,1.0,1.0,1.0]));
    buffers[buffers.length-1].setTranslateScale([-50,0.5,-100.0],[50.0,0.5,0.5],0);
    buffers.push(initMesh(gl, new OBJ.Mesh(cubeDefualt),[1.0,1.0,1.0,1.0]));
    buffers[buffers.length-1].setTranslateScale([1.0,0.5,-50.0],[0.5,0.5,50.0],0);
    buffers.push(initMesh(gl, new OBJ.Mesh(cubeDefualt),[1.0,1.0,1.0,1.0]));
    buffers[buffers.length-1].setTranslateScale([-100.0,0.5,-50.0],[0.5,0.5,50.],0);
    //
    window.onkeydown = (e) => {
        drawScene(gl, programInfo, buffers);
    }
    wallMapa = mapa;
    console.log(mapa);
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
    gl.uniform3fv(uniformLocations.lightPosition2, [0.0, -30.0,0.0]);
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
    //

    //Camera
    gl.uniform4fv(programInfo.uniformLocations.cameraPos, [playerPos.x,0.0,playerPos.z,1.0,])
    //console.log("cam");
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
    buffers[0].draw(gl, programInfo,rotateCamMatrix);
    let carXY = CarGameObject.getLightXY();
    gl.uniform3fv(programInfo.uniformLocations.carPosition,[carXY[1],0.0,carXY[0]]);
    gl.uniform1f(programInfo.uniformLocations.carLight,carLight);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, programInfo.textures.textureMaterial3);//programInfo.textures.textureMaterial);
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
    buffers[1].setTranslateScale([_startingCarPosition.x-2,0.0,_startingCarPosition.y],[0.5,0.5,0.5],0.0);
    buffers[1].draw(gl, programInfo,rotateCamMatrix);

    gl.activeTexture(gl.TEXTURE2);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);
    gl.bindTexture(gl.TEXTURE_2D, programInfo.textures.textureMaterial3);

    //TMP platform
    gl.uniform3fv(programInfo.uniformLocations.tLY, [-angleRotateCar+3.1,aX,0.0]);

    gl.uniform1i(programInfo.uniformLocations.uSampler, 2);
    buffers[2].setTranslateScale([0.0,-1.0,0.0],[0.5,0.5,0.5],0.0);
    buffers[2].draw(gl, programInfo,rotateCamMatrix);

    /*gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, programInfo.textures.textureMaterial4);
    gl.uniform1i(programInfo.uniformLocations.uSampler, 3);
    buffers[3].setTranslateScale(currentPose[2],[0.1,0.1,0.1],0.0);
    buffers[3].draw(gl, programInfo,rotateCamMatrix);*/

    for(let i = 4; i <4+shardPos.length;i++)
    {
        if(shardActive[i-4]) {
            gl.activeTexture(gl.TEXTURE3);
            gl.bindTexture(gl.TEXTURE_2D, programInfo.textures.textureMaterial4);//programInfo.textures.textureMaterial);
            gl.uniform1i(programInfo.uniformLocations.uSampler, 3);
            buffers[i].setTranslateScale([gameModelPos[i - 4].x, 0, gameModelPos[i - 4].y], [0.1, 0.1, 0.1], 0.0);
            buffers[i].draw(gl, programInfo, rotateCamMatrix);
        }
    }
    for(let i = 4+shardPos.length; i <4+shardPos.length+speedPos.length;i++)
    {
        if(speedActive[i-4-shardPos.length]) {
            gl.activeTexture(gl.TEXTURE3);
            gl.bindTexture(gl.TEXTURE_2D, programInfo.textures.textureMaterial);//programInfo.textures.textureMaterial);
            gl.uniform1i(programInfo.uniformLocations.uSampler, 3);
            buffers[i].setTranslateScale([gameModelPos[i - 4].x, 0, gameModelPos[i - 4].y], [0.1, 0.1, 0.1], 0.0);
            buffers[i].draw(gl, programInfo, rotateCamMatrix);
        }
    }
    // console.log([playerPos.x,playerPos.z]);
    // console.log([Math.floor(-xCarPos+8),Math.floor(zCarPos+0.5)]);
    //tmpCode
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, programInfo.textures.textureMaterial4);
    if(firsStart)
    {
        for(let i = 12; i <buffers.length-4;i++)
        {
            gl.uniform1i(programInfo.uniformLocations.uSampler, 2);
            buffers[i].draw(gl, programInfo, rotateCamMatrix);
        }
        firsStart= false;
    }
    else {

        for (let i = 100 - Math.floor(-xCarPos+8)-9; i < 100 - Math.floor(-xCarPos+8) + 13; i++) {
            if (i < 0) {
                continue;
            }
            if (i > 99) {
                continue;
            }
            for (let j = Math.floor(-(zCarPos+0.5))-10; j < Math.floor(-(zCarPos+0.5)) + 10; j++) {
                if (j < 0) {
                    continue;
                }
                if (j > 99) {
                    continue;
                }
                if (wallMAtrix[i][j] > 0) {
                    gl.uniform1i(programInfo.uniformLocations.uSampler, 2);
                    buffers[wallMAtrix[i][j]].draw(gl, programInfo, rotateCamMatrix);
                }
            }
        }
        gl.uniform1i(programInfo.uniformLocations.uSampler, 2);
        buffers[buffers.length-4].draw(gl, programInfo, rotateCamMatrix);
        gl.uniform1i(programInfo.uniformLocations.uSampler, 2);
        buffers[buffers.length-3].draw(gl, programInfo, rotateCamMatrix);
        gl.uniform1i(programInfo.uniformLocations.uSampler, 2);
        buffers[buffers.length-2].draw(gl, programInfo, rotateCamMatrix);
        gl.uniform1i(programInfo.uniformLocations.uSampler, 2);
        buffers[buffers.length-1].draw(gl, programInfo, rotateCamMatrix);

    }
    //

    /*for(let i = 4; i <buffers.length;i++)
    {
        gl.uniform1i(programInfo.uniformLocations.uSampler, 2);
        //buffers[i].setTranslateScale([i-3,0.0,0.0],[0.5,0.5,0.5],0.0);
        buffers[i].draw(gl, programInfo,rotateCamMatrix);
    }*/
}

addEventListener("keydown", alertKey);

function CanMove(car)
{
    let can = true;
    for(let i = 0; i <GameObject.length;i++)
    {
        if(car.intersects(GameObject[i]))
        {
            if(shardActive[i]) {
                console.log("shard!");
                //alert("СКРИМЕР АААААААА!");
                document.getElementById("sound").play();
                can = false;
                shardActive[i] = false;
            }
        }
    }
    for(let i = 0; i <speedGameObject.length;i++)
    {
        if(car.intersects(speedGameObject[i]))
        {
            if(speedActive[i]) {
                bonusCarSpeed+=0.5;
                console.log("speed!");
                //alert("СКРИМЕР АААААААА!");
                document.getElementById("sound2").play();
                can = false;
                speedActive[i] = false;

            }
        }
    }
    return can;
}


// 100 - Math.floor(-xCarPos+8) ----- carX
function alertKey(event) {
    let futureCar = new Collision2D(xCarPos,zCarPos,CarGameObject.r);
   if(event.key == "ArrowLeft") {
       futureCar.y += 0.05*Math.cos(angleRotateCar+ 0.035)*bonusCarSpeed;
       futureCar.x += -0.05*Math.sin(angleRotateCar+0.035)*bonusCarSpeed;
       if(!(Math.floor(99.4+futureCar.x)<0 || Math.floor(99.4+futureCar.x)>99
           || Math.floor(-futureCar.y+0.7)<0 || Math.floor(-futureCar.y+0.7)>99)) {
           if (wallMapa[Math.floor(99.4 + futureCar.x)][Math.floor(-futureCar.y + 0.7)] == 0) {
               angleRotateCar += 0.035;
               xCarPos += 0.05 * Math.cos(angleRotateCar) * bonusCarSpeed;
               zCarPos += -0.05 * Math.sin(angleRotateCar) * bonusCarSpeed;
               playerPos.x = -xCarPos + 7;
               playerPos.z = -zCarPos;
           }
       }
   }
   if(event.key == "ArrowRight") {
       futureCar.y += 0.05*Math.cos(angleRotateCar-0.035)*bonusCarSpeed;
       futureCar.x += -0.05*Math.sin(angleRotateCar-0.035)*bonusCarSpeed;
       if(!(Math.floor(99.4+futureCar.x)<0 || Math.floor(99.4+futureCar.x)>99
           || Math.floor(-futureCar.y+0.7)<0 || Math.floor(-futureCar.y+0.7)>99)) {
           if (wallMapa[Math.floor(99.4 + futureCar.x)][Math.floor(-futureCar.y + 0.2)] == 0) {
               angleRotateCar -= 0.035;
               xCarPos += 0.05 * Math.cos(angleRotateCar) * bonusCarSpeed;
               zCarPos += -0.05 * Math.sin(angleRotateCar) * bonusCarSpeed;
               playerPos.x = -xCarPos + 7;
               playerPos.z = -zCarPos;
           }
       }
   }
    if(event.key == "ArrowUp") {
        futureCar.y += 0.05*Math.cos(angleRotateCar)*bonusCarSpeed;
        futureCar.x += -0.05*Math.sin(angleRotateCar)*bonusCarSpeed;
        if(!(Math.floor(99.4+futureCar.x)<0 || Math.floor(99.4+futureCar.x)>99
            || Math.floor(-futureCar.y+0.7)<0 || Math.floor(-futureCar.y+0.7)>99)) {
            if (wallMapa[Math.floor(99.4 + futureCar.x)][Math.floor(-futureCar.y + 0.5)] == 0) {
                xCarPos += 0.05 * Math.cos(angleRotateCar) * bonusCarSpeed;
                zCarPos += -0.05 * Math.sin(angleRotateCar) * bonusCarSpeed;
                playerPos.x = -xCarPos + 7;
                playerPos.z = -zCarPos;
            }
        }
    }
    if(event.key == "ArrowDown") {
        futureCar.y -= 0.05*Math.cos(angleRotateCar)*bonusCarSpeed;
        futureCar.x -= -0.05*Math.sin(angleRotateCar)*bonusCarSpeed;
        if(!(Math.floor(99.4+futureCar.x)<0 || Math.floor(99.4+futureCar.x)>99
            || Math.floor(-futureCar.y+0.7)<0 || Math.floor(-futureCar.y+0.7)>99)) {
            if (wallMapa[Math.floor(99.2 + futureCar.x)][Math.floor(-futureCar.y + 0.5)] == 0) {
                xCarPos -= 0.05 * Math.cos(angleRotateCar) * bonusCarSpeed;
                zCarPos -= -0.05 * Math.sin(angleRotateCar) * bonusCarSpeed;
                playerPos.x = -xCarPos + 7;
                playerPos.z = -zCarPos;
            }
        }
    }
    if(event.key == "L") {
        if (canLight2 > 0) {
            canLight2 = 0;
        } else {
            canLight2 = 1;
        }
    }
    if(event.key=="O")
    {
        if (sunLight > 0.0) {
            sunLight = 0.0;
        } else {
            sunLight = 1.0;
        }
    }

    if(event.key =="K")
    {
        if (carLight > 0.0) {
            carLight = 0.0;
        } else {
            carLight = 1.0;
        }
    }
    if(event.key =="w")
    {
        if(wallMapa.length + 9 - playerPos.x <0 || wallMapa.length+9-playerPos.x>wallMapa.length-1)
        {
            playerPos.x += 1;
        }
        else// if(wallMapa[wallMapa.length + 9 - Math.floor(playerPos.x)][Math.floor(playerPos.z)]==0)
        {
             playerPos.x += 1;
        }
        //loadPos.x+=1;
    }
    if(event.key =="s")
    {
        if(wallMapa.length + 11 - playerPos.x <0 || wallMapa.length+11-playerPos.x>wallMapa.length-1)
        {
            playerPos.x -= 1;
        }
        else// if(wallMapa[wallMapa.length + 11 - Math.floor(playerPos.x)][Math.floor(playerPos.z)]==0)
        {
            playerPos.x -= 1;
        }
        //loadPos.x-=1;
    }
    if(event.key =="a")
    {
        if(playerPos.z <0 || playerPos.z>wallMapa.length-1 || wallMapa.length + 10 - playerPos.x <0 || wallMapa.length+10-playerPos.x>wallMapa.length-1)
        {
            playerPos.z-=1;
        }
        else// if(wallMapa[wallMapa.length + 10 - Math.floor(playerPos.x)][Math.floor(playerPos.z)-1]==0)
        {
            playerPos.z-=1;
        }
        //loadPos.y-=1;
    }
    if(event.key =="d")
    {
        if(playerPos.z <0 || playerPos.z>wallMapa.length-1 || wallMapa.length + 10 - playerPos.x <0 || wallMapa.length+10-playerPos.x>wallMapa.length-1)
        {
            playerPos.z+=1;
        }
        else// if(wallMapa[wallMapa.length + 10 - Math.floor(playerPos.x)][Math.floor(playerPos.z)+1]==0)
        {
            playerPos.z+=1;
        }
        //loadPos.y+=1;
    }
    if(event.key=="q")
    {
        rotateCamMatrix[1]-=0.1;
    }
    if(event.key=="e")
    {
        rotateCamMatrix[1]+=0.1;
    }
    if(event.key=="r")
    {
        xCarPos = _startingCarPosition.x;
        zCarPos = _startingCarPosition.y;
    }
    if(CanMove(futureCar))
    {
        let portal = 0;
        for(let i = 0; i<shardActive.length;i++)
        {
            if(!shardActive[i])
            {
                portal++;
            }
        }
        if(portal==shardActive.length && endGameBool)
        {
            let mainMusic = document.getElementById("mainSound");
            mainMusic.pause();
            finalGameImg.src = "lenin.png"//"https://topcor.ru/uploads/posts/2018-09/1535951858_maxresdefault.jpg";
            document.querySelector("#gl_canvas").width=0;
            document.querySelector("#gl_canvas").height=0;
            document.querySelector("#map_canvas").width=0;
            document.querySelector("#map_canvas").height=0;
            document.querySelector("#Lenin").height=800;
            document.querySelector("#Lenin").width=1200;
            document.querySelector("#map_canvas").getContext("2d").drawImage(finalGameImg,0,0);
            document.getElementById("sound3").play();
            endGameBool = false;

        }
    }


    /*if(wallMapa[Math.floor(99+xCarPos)][Math.floor(-zCarPos+0.5)]==1)
    {
        if(wallMapa[Math.floor(99+xCarPos-1)][Math.floor(-zCarPos+0.5)]!=1)
        {
            xCarPos-=1;
        }
        else if(wallMapa[Math.floor(99+xCarPos+1)][Math.floor(-zCarPos+0.5)]!=1)
        {
            xCarPos+=1;
        }
        else if(wallMapa[Math.floor(99+xCarPos)][Math.floor(-zCarPos+0.5-1)]!=1)
        {
            zCarPos-=1;
        }
        else if(wallMapa[Math.floor(99+xCarPos)][Math.floor(-zCarPos+0.5+1)]!=1)
        {
            zCarPos+=1;
        }
        else
        {
            xCarPos = _startingCarPosition.x;
            zCarPos = _startingCarPosition.y;
        }
    }*/
    xLightPos = futureCar.y;
    zLightPos = futureCar.x;
    CarGameObject.updateCurrentCoords(zCarPos,xCarPos);
    CarGameObject.rotateLight(angleRotateCar);

}