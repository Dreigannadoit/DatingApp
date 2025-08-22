"use client"

import { UserProfile } from '@/app/profile/page'
import { createOrGetChannel, getStreamUserToken } from '@/lib/actions/stream'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Channel, StreamChat } from "stream-chat";

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
    const [newMessage, setNewMessage] = useState<string>("")

    const [client, setClient] = useState<StreamChat | null>(null);
    const [channel, setChannel] = useState<Channel | null>(null);

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

                setClient(chatClient)
                setChannel(chatChannel)

            } catch (error) {
                router.push("/chat")
            } finally {
                setLoading(false

                )
            }
        }

        if (otherUser) initiailzeChat()
    }, [otherUser])

    if (!client || !channel) {
        return (
            <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                        Setting up chat...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-900">
            <div
                className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth chat-scrollbar relative"
                style={{ scrollBehavior: "smooth" }}
            >
                {messages.map((message) => (
                    <div></div>
                ))}

            </div>

            {/* Message Input */}

            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <form className="flex space-x-2" >
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value)
                        }}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                        disabled={!channel}
                    />
                </form>
            </div>
        </div>
    )
}

export default StreamChatInterface