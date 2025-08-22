"use client"

import { UserProfile } from '@/app/profile/page'
import { createOrGetChannel, getStreamUserToken } from '@/lib/actions/stream'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { StreamChat } from "stream-chat";

interface Message {
    id: string;
    text: string;
    sender: "me" | "other";
    timestamp: Date;
    user_id: string;
}

const StreamChatInterface = ({ otherUser }: { otherUser: UserProfile }) => {
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentUserId, setCurrentUserId] = useState<string>("")

    const [messages, setMessages] = useState<Message[]>([])

    useEffect(() => {
        async function initiailzeChat() {
            try {
                setError(null)

                const { token, userId, userName, userImage } = await getStreamUserToken()

                setCurrentUserId(userId!)

                const chatClient = StreamChat.getInstance(
                    process.env.NEXT_PUBLIC_STREAM_API_KEY!,
                    process.env.STREAM_API_SECRET!
                )

                await chatClient.connectUser({
                    id: userId!,
                    name: userName,
                    image: userImage
                }, token)

                const { channelType, channelId } = await createOrGetChannel(otherUser.id)

                // Get the channel
                const chatChannel = chatClient.channel(channelType!, channelId)
                await chatChannel.watch()

                // load existing messages
                const state = await chatChannel.query({ messages: { limit: 52 } })

                // Convert stream messages to our format
                const convertedMessages: Message[] = state.messages.map((msg) => ({
                    id: msg.id, 
                    text: msg.text || "",
                    sender: msg.user?.id === userId ? "me" : "other",
                    timestamp: new Date(msg.created_at || new Date()),
                    user_id: msg.user?.id || ""
                }))

                setMessages(convertedMessages)

            } catch (error) {
                router.push("/chat")
            } finally {
                setLoading(false

                )
            }
        }

        if (otherUser) initiailzeChat()
    }, [otherUser])

    return (
        <div>StreamChatInterface</div>
    )
}

export default StreamChatInterface