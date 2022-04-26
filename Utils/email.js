const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');


// new Email(user, url).sendWelcome();

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.form = `eric <${process.env.EMAIL_FROM}>`;
    }

    newTransport() {
        if(process.env.NODE_ENV === 'production') {

            return 1;
        }
        return nodemailer.createTransport({
            // service: 'Gmail',
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
            //Activate in gmail "less secure app" option
        });
    }

   async send(template, subject) {
        //send email
        //render html based on a pug template
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        })//轉成HTML

        //email options
        const mailOptions = {
            from:this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText(html)
            // html:
        };

        //create a transporter and send
       await this.newTransport().sendMail(mailOptions);
    }
    // eslint-disable-next-line lines-between-class-members
    async sendWelcome() {
       await this.send('welcome', 'Welcome to the natours!');
    }

    async sendPasswordReset() {
        await this.send('passwordReset', 'Your password reset token (valid for only 10 min)');

    }
};
