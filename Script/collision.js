export default class Collision2D {
    constructor (x,y,r){
        this.x=x;
        this.y=y;
        this.r=r;
        this.hLight =0.2;
        this.xLight = x;
        this.yLight = this.hLight+y;
    }

    getLightXY(){
        return [this.xLight, this.yLight]
    }

    updateCurrentCoords(currentX, currentY)
    {
        this.x = currentX;
        this.y = currentY;
    }

    rotateLight(angle){
        this.xLight = this.x;
        this.yLight = this.hLight+this.y;
        this.xLight =   this.x  - this.hLight *Math.sin(angle);
        this.yLight =  this.y + this.hLight *Math.cos(angle);
    }


    intersects(collision){
        return Math.sqrt((collision.x - this.x)*(collision.x - this.x)+
            (collision.y - this.y)*(collision.y - this.y))<this.r+collision.r
    }
}