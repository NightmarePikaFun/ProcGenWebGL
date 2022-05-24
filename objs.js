"use strict";

import { sphere } from './sphere';
import {initShaderProgram, loadTexture} from './openGLfuncs';
const OBJ = require('webgl-obj-loader');

function getOrangeFromFile() {
//    const opt = {calcTangentsAndBitangents: true};
    let mesh = new OBJ.Mesh(sphere);//, opt);
    return mesh;
}

function makeF32ArrayBuffer(gl, array) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW );// Заполняем буффер массивом флоатов
    return buffer
}

export function initMesh(gl, mesh, color, url) {

    let model = mat4.create();;
    const _draw = (gl, programInfo,rotateCamMatrix) => {
        gl.activeTexture(gl.TEXTURE1);
        const vertexPos = programInfo.attribLocations.vertexPosition;
        const modelViewMatrix = programInfo.uniformLocations.modelViewMatrix;
        gl.uniformMatrix4fv(modelViewMatrix, false, model);
        const viewMatrix = mat4.create();
        mat4.lookAt(viewMatrix, [4.0, 3.0, 3.0], rotateCamMatrix, [0.0, 1.0, 0.0] )
        gl.uniformMatrix4fv(programInfo.uniformLocations.viewMatrix, false, viewMatrix);
        
        const nMatrix = mat3.create();
        mat3.normalFromMat4(nMatrix, model)
        const normalMatrixPos = programInfo.uniformLocations.normalMatrix;
        gl.uniformMatrix3fv(normalMatrixPos, false, nMatrix);

        //Color
        gl.uniform4fv(programInfo.uniformLocations.color, color);//[1.0, 0.45, 0.0, 1.0]);

        //Texture
        OBJ.initMeshBuffers(gl, mesh);

        //Attribute
        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        gl.enableVertexAttribArray(2);



        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
        gl.vertexAttribPointer(0, mesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
        gl.vertexAttribPointer(1, mesh.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.textureBuffer);
        gl.vertexAttribPointer(2, mesh.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
        

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
        gl.drawElements(gl.TRIANGLES, mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    }

    let translateV = [0,0,0]
    let scaleV = [1,1,1];
    let angleV = 0.0
    const _setTranslateScale = (transl, scl, angle) => {
        model = mat4.create();
        translateV = transl;
        mat4.translate(model, model, translateV);
        scaleV = scl
        mat4.scale(model, model, scaleV);
        angleV = angle;
        mat4.rotate(model,model,angleV,[0,1,0]);
    }




    return {
        draw: _draw,
        setTranslateScale: _setTranslateScale,
    };
};

function loadImage(url)
{
    var image = new Image();
    image.crossOrigin = "anonymous";
    image.src = url;
    return image;
}
