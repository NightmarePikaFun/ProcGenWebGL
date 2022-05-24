"use strict";

const PointLightStruct =`
uniform struct PointLight {
    vec3 position;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
} light;
`;

const PointLightStruct2 =`
uniform struct PointLight2 {
    vec3 position;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    vec3 direction;
    float on;
} light2;
`;

const PointLightStruct3 =`
uniform struct PointLight3 {
    vec3 position;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    vec3 direction;
    float on;
} light3;
`;

const LightSceneParams =`
uniform struct SceneParams {
    vec3 viewPosition;
} params;
`;

const CarLight = `
uniform struct CarLight{
    vec3 carPosition;
    float carLight;
} carLight;`

const SpotLight =`
uniform struct SpotLight {
    vec3 direction;
    vec3 attenuation;
    vec4 specular;
    vec4 diffuse;
    vec4 ambient;
    vec4 position;
    float exp;
    float cutoff;
    
    
} spotLight;
`;

const Funcs =`
    vec3 lambert(PointLight light, vec3 normal, vec3 lightDirection) {
        float diffuseLightDot = max(dot(normal, lightDirection), 0.1);  
        return light.diffuse * diffuseLightDot;
    }
    
    vec3 lambert(vec3 ambient,vec3 diffuse, vec3 normal,vec3 lightDirection)
    {
        float diffuseLightDot = max(dot(normal, lightDirection), 0.1);          
        return diffuse * diffuseLightDot;
    }
    
    vec3 lambertA(vec3 ambient,vec3 diffuse, vec3 normal,vec3 lightDirection)
    {
        float diffuseLightDot = max(dot(normal, lightDirection), 0.1);          
        return ambient*diffuse * diffuseLightDot;
    }
    
    const float shininess = 16.0;

    vec3 blinn(PointLight light, vec3 normal, vec3 lightDirection, vec3 eye) {

        vec3 sum =- normalize((lightDirection + eye)/2.0);
        float specularLightDot = max(dot(normal, sum), 0.1);
        float specularLightParam = pow(specularLightDot, shininess);
        return lambert(light, normal, lightDirection) + light.specular * specularLightParam ;
    }
    
    vec3 blinn(vec3 ambient, vec3 diffuse, vec3 specular, vec3 normal, vec3 lightDirection, vec3 eye) {

        vec3 sum =- normalize((lightDirection + eye)/2.0);
        float specularLightDot = max(dot(normal, sum), 0.1);
        float specularLightParam = pow(specularLightDot, shininess);
        return lambert(ambient,diffuse, normal, lightDirection) + specular * specularLightParam ;
    }
    
    vec3 blinnA(vec3 ambient, vec3 diffuse, vec3 specular, vec3 normal, vec3 lightDirection, vec3 eye) {

        vec3 sum =- normalize((lightDirection + eye)/2.0);
        float specularLightDot = max(dot(normal, sum), 0.1);
        float specularLightParam = pow(specularLightDot, shininess);
        return lambertA(ambient,diffuse, normal, lightDirection) + specular * specularLightParam ;
    }
`;

const transformFunc =`
    mat3 transformMatrix(float x_angle, float y_angle, float ang){
        return mat3(
        1, 0, 0,
        0, cos(ang),  sin(ang),
        0, -sin(ang), cos(ang)
    ) * mat3(
        cos(x_angle), -sin(x_angle), 0,
        sin(x_angle), cos(x_angle), 0,
        0, 0, 1
    ) *
        mat3(
        cos(y_angle), 0, sin(y_angle),
        0, 1, 0,
        -sin(y_angle), 0, cos(y_angle)
    );
    }
    
    
    mat3 transformMatrixY(float ang){
        return mat3(
        cos(ang), -sin(ang), 0,
        sin(ang), cos(ang), 0,
        0, 1, 0
    );
    }
`;

//////////////////////////////////////////////////////////// V E R T E X        S H A D E R /////////////////////////////////////////
// Исходный код вершинного шейдера
export const vsSource = `#version 300 es
precision mediump float;
// Координаты вершины. Атрибут, инициализируется через буфер.
in vec3 avertexPosition;
in vec3 anormalPosition;
in vec2 textureCoords;
in vec3 tangent;
in vec3 binormal;


${PointLightStruct}
${PointLightStruct2}
${PointLightStruct3}
${SpotLight}
${LightSceneParams}
${Funcs}
${transformFunc}
${CarLight}

uniform mat4 uModelViewMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
uniform vec3 tmpY;
uniform vec4 camPos;

out vec3 vnormal;
out vec2 texCoord;
out vec3 vertexPos3;
out vec3 lightDir;
out vec3 lightDir2;
out vec3 lightDir3;
out vec3 viewDir;
out float distance;

out vec3 tmpPos;
out vec3 toLight;

void main() {
    vec4 vertexPositionEye4 = /*uViewMatrix */uModelViewMatrix * vec4(avertexPosition, 1.0);
    vertexPositionEye4 = vec4(vertexPositionEye4.xyz * transformMatrix(0.0,-0.653,0.),1.0);//transformMatrix(0.5,-0.653,0.0)
    vertexPositionEye4+=vec4(camPos.xyz* transformMatrix(0.0,-0.653,0.),1.0);//
    vec3 vertexPositionEye3 = (vertexPositionEye4.xyz)/vertexPositionEye4.w ;

   
    // получаем вектор направления света
    vec3 lightDirection = normalize(light.position - vertexPositionEye3);
    vec3 lightDirection2 = normalize(light2.position - vertexPositionEye3);
    vec3 lightDirection3 = normalize(light3.position - vertexPositionEye3);
    // получаем нормаль
    vec3 normal = normalize(uNormalMatrix * anormalPosition);

    gl_Position = (uProjectionMatrix *  uViewMatrix *vertexPositionEye4);

    //TestCode
    tmpPos =vec3(vertexPositionEye3.z-carLight.carPosition.z,vertexPositionEye3.y,vertexPositionEye3.x-carLight.carPosition.x)*transformMatrix(4.5,tmpY.x,0.);
    toLight = -tmpPos*4.0+light2.position;
   //

    vnormal = normal;
    texCoord = textureCoords;
    lightDir = lightDirection;
    lightDir2 = lightDirection2;
    lightDir3 = lightDirection3;
    distance = length(lightDirection);
    viewDir = vec3(4.0,3.0,3.0)-vertexPositionEye3;
    vertexPos3 = vertexPositionEye3;
}
`;


//////////////////////////////////////////////////////////// F R A G M E N T        S H A D E R /////////////////////////////////////////


// Исходный код фрагментного шейдера
export const fsSource = `#version 300 es
// WebGl требует явно установить точность флоатов, так что ставим 32 бита
precision mediump float;

${PointLightStruct}
${PointLightStruct2}
${PointLightStruct3}
${LightSceneParams}
${SpotLight}
${Funcs}
${CarLight}

in vec3 vnormal;
in vec2 texCoord;
uniform vec4 uColor;
uniform sampler2D uSampler;

in vec3 lightDir;
in vec3 lightDir2;
in vec3 lightDir3;
in vec3 vertexPos3;
in float distance;
in vec3 viewDir;

in vec3 tmpPos;
in vec3 toLight;

out vec4 color;

void main() {
    vec3 norm = normalize(vnormal);
    vec3 lightDirection = normalize(lightDir);
    vec3 lightDirection2 = normalize(lightDir2);
    vec3 lightDirection3 = normalize(lightDir3);
    
    
    color = vec4(blinn(light, norm, lightDirection, vertexPos3) * texture(uSampler,texCoord).xyz, uColor.a)*light2.on;
    color = color+vec4(blinn(light2.ambient, light2.diffuse,light2.specular, norm, lightDirection2, vertexPos3) * texture(uSampler,texCoord).xyz, uColor.a)*light2.on;
    color += color+vec4(blinnA(light3.ambient, light3.diffuse,light3.specular,norm,lightDirection3, vertexPos3)*texture(uSampler,texCoord).xyz, uColor.a)*light3.on;
    
    vec3 tmpNormal = normalize(tmpPos);
    vec3 surfToLight = normalize(toLight);
    float tmpLight = max(dot(tmpNormal, surfToLight),0.0);
    color+= vec4(vec3(texture(uSampler,texCoord).xyz*vec3(0.3,0.2,0.0)*tmpLight*1.5)*carLight.carLight,1.0);

    
    

    float spotEffect =0.1;//= dot(normalize(spotLight.direction), -lightDir.xyz);
    /*if (spotEffect < spotLight.cutoff)
    {
        spotEffect = max( pow(spotEffect, spotLight.exp), 0.1);
        float attenuation2 = spotEffect/(spotLight.attenuation.x +
        spotLight.attenuation.y * distance +
        spotLight.attenuation.z * distance * distance);
        color = color + spotLight.ambient * spotLight.ambient * attenuation2;
        float Ndot = max(dot(norm,lightDir.xyz),0.0);
        color += Ndot* attenuation2;
        vec3 h = normalize(lightDir.xyz+vec3(4.0,3.0,3.0));
        float RdotVpow = normalize(max(pow(dot(norm, h), 0.1),1.0));
        //color += spotLight.specular * spotLight.specular * RdotVpow * attenuation2;
    }*/
}
`;