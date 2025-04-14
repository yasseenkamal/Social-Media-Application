import nodemailer from "nodemailer"



export const sendEmail = async ({ to = "", cc = "", bcc = "", subject = "saraha application", text = "", html = "", attachments = [] }={}) => {

if(!to || !subject){
    throw new Error("Invalid email parameters: 'to' and 'subject' are required.");
}

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

 
    
    const info = await transporter.sendMail({
        from: ` "SocialMediaApp 🤳🏻📱" <${process.env.EMAIL}>`, 
        to,
        cc,
        bcc,
        text,
        html,
        subject,
        attachments,
        
    });

    return info

}


