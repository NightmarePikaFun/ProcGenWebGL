export default class Ant{
    constructor(count,height,width,iteration) {
        this.count = count;
        this.height = height;
        this.width = width;
        this.iteration = iteration;

        this.map = [];
        this.pathMap=[];
        for(let i = 0; i <this.height;i++)
        {
            this.map[i] = [];
            this.pathMap[i]=[];
            for(let j = 0; j <this.width;j++)
            {
                this.map[i][j]=0;
                this.pathMap[i][j]=0;
            }
        }
        console.log(this.map);

        this.moveStep = [{x:-1,y:0},{x:0,y:-1},{x:1,y:0},{x:0,y:1}]
    }
}

Ant.prototype.setLandSize = function (size)
{
    this.iteration = size;
}

Ant.prototype.move = function (){
    let position = {x:Math.floor(Math.random()*this.width),y:Math.floor(Math.random()*this.height)};
    if(position.x==this.width)
    {
        position.x = position.x-1;
    }
    if(position.y==this.height)
    {
        position.y = position.y-1;
    }
    let dir = 2;
    console.log([position.x,position.y]);
    console.log(this.pathMap);
    for(let i = 0; i<this.iteration;i++)
    {
        if(this.pathMap[position.x][position.y]==1)
        {
            dir=dir+1;
            if(dir>3)
            {
                dir = 0;
            }
            if(position.x<0)
            {
                position.x = this.width-1;
            }
            if(position.x>this.width-1)
            {
                position.x = 0;
            }
            if(position.y<0)
            {
                position.y = this.height-1;
            }
            if(position.y>this.height-1)
            {
                position.y = 0;
            }
            this.pathMap[position.x][position.y]=0;
            position.x += this.moveStep[dir].x;
            position.y += this.moveStep[dir].y;
        }
        else{
            dir=dir-1;
            if(dir<0)
            {
                dir = 3;
            }
            if(position.x<0)
            {
                position.x = this.width-1;
            }
            if(position.x>this.width-1)
            {
                position.x = 0;
            }
            if(position.y<0)
            {
                position.y = this.height-1;
            }
            if(position.y>this.height-1)
            {
                position.y = 0;
            }
            this.pathMap[position.x][position.y]=1;
            this.map[position.x][position.y]=1;
            position.x += this.moveStep[dir].x;
            position.y += this.moveStep[dir].y;
        }
    }
    console.log("After ant move");
    console.log(this.pathMap);
    console.log(this.map);
    return this.map;
}