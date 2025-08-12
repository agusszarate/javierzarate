// app/api/send-email/route.ts
import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    const { subject, text } = await req.json()

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    })

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_TO_SEND,
            subject,
            text,
        })

        return NextResponse.json({ message: 'Correo enviado correctamente' })
    } catch (error) {
        return NextResponse.json({ message: 'Error enviando el correo', error }, { status: 500 })
    }
}
