import Phaser from 'phaser'

export default class HelloWorldScene extends Phaser.Scene
{
    private platforms?: Phaser.Physics.Arcade.StaticGroup
    private player?: Phaser.Physics.Arcade.Sprite
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
    private stars?: Phaser.Physics.Arcade.Group

    private score = 0
    private scoreText?: Phaser.GameObjects.Text

    private titleText?: Phaser.GameObjects.Text
    private startText?: Phaser.GameObjects.Text
    private gameOverText?: Phaser.GameObjects.Text
    private restartText?: Phaser.GameObjects.Text

    private ufos?: Phaser.Physics.Arcade.Group

    private gameStart = false
    private gameOver = false

    private handleCollectStar(player: Phaser.GameObjects.GameObject, starObject: Phaser.GameObjects.GameObject) {
        const star = starObject as Phaser.Physics.Arcade.Image
        star.disableBody(true, true)

        this.score += 10
        this.scoreText?.setText(`Score: ${this.score}`)

        if (this.stars?.countActive(true) === 11)
        {
            this.titleText?.destroy()

            if (this.player)
            {
                const x = this.player.x < 400
                    ? Phaser.Math.Between(400, 800)
                    : Phaser.Math.Between(0, 400)

                const ufo: Phaser.Physics.Arcade.Image = this.ufos?.create(x, 16, 'ufo')
                ufo.setBounce(1)
                ufo.setCollideWorldBounds(true)
                ufo.setVelocityY(Phaser.Math.Between(-200, 200), 20)
            }
        }

        if (this.stars?.countActive(true) === 0)
        {
            this.stars.children.iterate(starObject => {
                const child = starObject as Phaser.Physics.Arcade.Image
                child.enableBody(true, child.x, 0, true, true)
            })

            if (this.player)
            {
                const x = this.player.x < 400
                    ? Phaser.Math.Between(400, 800)
                    : Phaser.Math.Between(0, 400)

                const ufo: Phaser.Physics.Arcade.Image = this.ufos?.create(x, 16, 'ufo')
                ufo.setBounce(1)
                ufo.setCollideWorldBounds(true)
                ufo.setVelocityY(Phaser.Math.Between(-200, 200), 20)
            }
        }
    }

    private handleTouchUFO(player: Phaser.Physics.Arcade.Image, ufoObject: Phaser.Physics.Arcade.Sprite) {    
        if (ufoObject?.body.touching.up && player?.body.touching.down) {
            ufoObject.destroy()
        }
        else {
            this.physics.pause()

            this.player?.setTint(0xff0000)
            this.player?.anims.play('turn')

            this.gameOverText = this.add.text(240, 55, 'GAME OVER', {
                fontSize: '58px',
                color: '#fff'
            })

            this.restartText = this.add.text(212, 130, 'Press space to restart', {
                fontSize: '28px',
                color: '#fff'
            })
            
            this.gameOver = true
        }
        
        
    }

	constructor()
	{
		super('hello-world')
	}

	preload()
    {
        this.load.image('sky', 'assets/sky.png')
        this.load.image('ground', 'assets/platform.png')
        this.load.image('star', 'assets/star.png')
        this.load.image('ufo', 'assets/ufo.png')
        this.load.spritesheet('dude', 'assets/dude.png', { 
            frameWidth: 32, frameHeight: 48 
        })
    }

    create()
    {
        this.add.image(400, 300, 'sky')

        this.platforms = this.physics.add.staticGroup()
        const ground = this.platforms.create(400, 568, 'ground') as Phaser.GameObjects.Sprite

        ground 
            .setScale(2)
            .refreshBody()

        this.platforms.create(600, 400, 'ground')
        this.platforms.create(50, 250, 'ground')
        this.platforms.create(750, 220, 'ground')

        if (this.gameStart === false) {
            this.titleText = this.add.text(140, 55, 'STAR COLLECTOR', {
                fontSize: '64px',
                color: '#fff'
            })

            this.startText = this.add.text(188, 130, 'Press an arrow key to move', {
                fontSize: '28px',
                color: '#fff'
            })
        }

        this.player = this.physics.add.sprite(100, 450, 'dude')
        this.player.setBounce(0.2)
        this.player.setCollideWorldBounds(true)

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', {
                start: 0, end: 3
            }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 4 }],
            frameRate: 20
        })

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', {
                start: 5, end: 8
            }),
            frameRate: 10,
            repeat: -1
        });

        this.physics.add.collider(this.player, this.platforms)

        this.cursors = this.input.keyboard.createCursorKeys()

        this.stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        })

        this.stars.children.iterate(starsChild => {
            const child = starsChild as Phaser.Physics.Arcade.Image
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
        })

        this.physics.add.collider(this.stars, this.platforms)
        this.physics.add.overlap(this.player, this.stars, this.handleCollectStar, undefined, this)

        this.scoreText = this.add.text(16, 16, 'score: 0', {
            fontSize: '32px',
            color: '#fff'
        })

        this.ufos = this.physics.add.group()

        this.physics.add.collider(this.ufos, this.platforms)
        this.physics.add.collider(this.player, this.ufos, this.handleTouchUFO, undefined, this)
    }

    update() {
        if (!this.cursors) 
        {
            return
        }

        if (this.cursors.left?.isDown) 
        {
            this.gameStart = true
            this.player?.setVelocityX(-160)
            this.player?.anims.play('left', true)
        }

        else if (this.cursors.right?.isDown) 
        {
            this.gameStart = true
            this.player?.setVelocityX(160)
            this.player?.anims.play('right', true)
        }

        else 
        {
            this.player?.setVelocityX(0)
            this.player?.anims.play('turn')
        }

        if (this.cursors.up?.isDown && this.player?.body.touching.down)
        {
            this.player.setVelocity(-330)
        } 

        if (this.gameStart === true) {
            this.startText?.destroy()
        }

        if (this.gameOver === true) {
            if (this.cursors.space?.isDown) {
                this.registry.destroy()
                this.events.off()
                this.scene.restart()
            }

            this.gameStart = false;
        }
    }
}
