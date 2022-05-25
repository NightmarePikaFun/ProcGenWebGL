export default class Ant{
    constructor(count,height,width,iteration) {
        this.count = count;
        this.height = height;
        this.width = width;
        this.iteration = iteration;

        this.map = [];
        this.pathMap=[];
        this.mapWall = [];
        this.lootMap = [];
        for(let i = 0; i <this.height;i++)
        {
            this.mapWall[i] = [];
            this.map[i] = [];
            this.pathMap[i]=[];
            this.lootMap[i]=[];
            for(let j = 0; j <this.width;j++)
            {
                this.mapWall[i][j] = 0;
                this.map[i][j]=0;
                this.pathMap[i][j]=0;
                this.lootMap[i][j]=0;
            }
        }
        this.antCounter = 0;
        this.antStartPosition = {x:0,y:0};
        this.moveStep = [{x:-1,y:0},{x:0,y:-1},{x:1,y:0},{x:0,y:1}]
        this.allAntStartPos = [];
        this.moveSpeedGift = 0;
        this.speedGiftPos = [];
        this.dropCount = 0;
        this.portalShard = 0;
        this.portalShardPos = [];
    }
}

Ant.prototype.getShardPoint = function ()
{
    return this.portalShardPos;
}

Ant.prototype.getSpeedGiftPoint = function ()
{
    return this.speedGiftPos;
}

Ant.prototype.getAllStarPoint = function ()
{
    return this.allAntStartPos;
}

Ant.prototype.getStartPosition = function ()
{
    return this.antStartPosition;
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
    if(this.antCounter == 0)
    {
        this.antStartPosition = {x:position.x,y:position.y};
    }
    this.allAntStartPos[this.antCounter]={x:position.x,y:position.y};
    this.antCounter++;
    let dir = 2;
    let shardChance = 0.1;
    let speedChance = 0.9;
    for(let i = 0; i<this.iteration;i++)
    {
        if(this.pathMap[position.x][position.y]==1)
        {
            dir=dir+1;
            if(dir>3)
            {
                dir = 0;
            }

            this.pathMap[position.x][position.y]=0;
            position.x += this.moveStep[dir].x;
            position.y += this.moveStep[dir].y;
            if(position.x<0)
            {
                position.x = 0;
            }
            if(position.x>this.width-1)
            {
                position.x = this.width-1;
            }
            if(position.y<0)
            {
                position.y = 0;
            }
            if(position.y>this.height-1)
            {
                position.y = this.height-1;
            }
        }
        else{
            dir=dir-1;
            if(dir<0)
            {
                dir = 3;
            }

            this.pathMap[position.x][position.y]=1;
            this.map[position.x][position.y]=1;
            position.x += this.moveStep[dir].x;
            position.y += this.moveStep[dir].y;
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
        }
        if(Math.random()>speedChance && this.dropCount<this.antCounter && this.lootMap[position.x][position.y]==0)
        {
            this.speedGiftPos[this.moveSpeedGift]= {x:position.x,y:position.y};
            this.moveSpeedGift++;
            this.dropCount++;
            this.lootMap[position.x][position.y]=2;
            //this.mapWall[position.x][position.y]=2;
            for(let i = -3; i<3;i++)
            {
                for(let j =-3;j<3;j++)
                {
                    let x = position.x+i,y = position.y+j;
                    if(x<0 || x>99)
                    {
                        x = position.x;
                    }
                    if(y<0||y>99)
                    {
                        y = position.y;
                    }
                    if(y!= position.y || x!=position.x) {
                        if(this.lootMap[x][y]!=3) {
                            this.lootMap[x][y] = 9;
                        }
                    }
                }
            }
        }
        else if(this.lootMap[position.x][position.y]!=0)
        {
            speedChance-=0.1;
        }
        if(Math.random()<shardChance && this.dropCount<this.antCounter && this.lootMap[position.x][position.y]==0){
            this.portalShardPos[this.portalShard]= {x:position.x,y:position.y};
            this.portalShard++;
            this.dropCount++;
            this.lootMap[position.x][position.y]=3;
            //this.mapWall[position.x][position.y]=3;
            for(let i = -3; i<3;i++)
            {
                for(let j =-3;j<3;j++)
                {
                    let x = position.x+i,y = position.y+j;
                    if(x<0 || x>99)
                    {
                        x = position.x;
                    }
                    if(y<0||y>99)
                    {
                        y = position.y;
                    }
                    if(y!= position.y || x!=position.x) {
                        if(this.lootMap[x][y]!=2) {
                            this.lootMap[x][y] = 9;
                        }
                    }
                }
            }
            console.log("--");
        }
        else if(this.lootMap[position.x][position.y]!=0)
        {
            shardChance+=0.1;
        }
    }
    /*for(let i  = 0 ; i<this.height; i++)
    {
        for(let j = 0; j<this.width;j++)
        {
            if(this.map[i][j]==0) {
                if (i - 1 >= 0) {
                    if (this.map[i - 1][j] == 1) {
                        this.mapWall[i][j] = 1;
                    }
                }
                if (j - 1 >= 0) {
                    if (this.map[i][j - 1] == 1) {
                        this.mapWall[i][j] = 1;
                    }
                }
                if (i + 1 < this.height) {
                    if (this.map[i + 1][j] == 1) {
                        this.mapWall[i][j] = 1;
                    }
                }
                if (j + 1 < this.width) {
                    if (this.map[i][j + 1] == 1) {
                        this.mapWall[i][j] = 1;
                    }
                }
            }
        }
    }*/
    return this.mapWall;
}

Ant.prototype.getMapWall = function ()
{
    console.log(this.dropCount, this.portalShard,this.moveSpeedGift);
    return this.mapWall;
}

Ant.prototype.createBridge = function ()
{
    for(let k = 0; k <this.allAntStartPos.length-1;k++)
    {
        let iterator, iterator2;;
        let p = Math.abs(this.allAntStartPos[k].x-this.allAntStartPos[k+1].x)+1;
        if(this.allAntStartPos[k].x> this.allAntStartPos[k+1].x){
            iterator = k+1;
        }
        else{
            iterator = k;
        }
        for(let p1 = 0; p1<p;p1++)
        {
            this.map[this.allAntStartPos[iterator].x+p1][this.allAntStartPos[iterator].y]=1;
        }
        let l = Math.abs(this.allAntStartPos[k].y-this.allAntStartPos[k+1].y)+1;
        if(this.allAntStartPos[k].y < this.allAntStartPos[k+1].y){
            iterator2 = k;
        }
        else{
            iterator2 = k+1;
        }
        for(let l1 = 0; l1<l;l1++)
        {
            this.map[this.allAntStartPos[iterator].x+p][this.allAntStartPos[iterator2].y+l1]=1;
        }
    }
}

Ant.prototype.createWall = function () {
    for (let i = 0; i < this.height; i++) {
        for (let j = 0; j < this.width; j++) {
            if (this.map[i][j] == 0) {
                if (i - 1 >= 0) {
                    if (this.map[i - 1][j] == 1) {
                        this.mapWall[i][j] = 1;
                    }
                }
                if (j - 1 >= 0) {
                    if (this.map[i][j - 1] == 1) {
                        this.mapWall[i][j] = 1;
                    }
                }
                if (i + 1 < this.height) {
                    if (this.map[i + 1][j] == 1) {
                        this.mapWall[i][j] = 1;
                    }
                }
                if (j + 1 < this.width) {
                    if (this.map[i][j + 1] == 1) {
                        this.mapWall[i][j] = 1;
                    }
                }
            }
        }
    }
}