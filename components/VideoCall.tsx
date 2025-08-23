// VideoCall.tsx
import React, { useEffect, useState } from 'react'
import {
    Call,
    CallControls,
    SpeakerLayout,
    StreamCall,
    StreamTheme,
    StreamVideo,
    StreamVideoClient,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { getStreamVideoToken } from '@/lib/actions/stream';
import LoadingState from './LoadingState';

interface VideoCallProps {
    callId: string;
    onCallEnd: () => void;
    isIncoming?: boolean;
}

const VideoCall = ({
    callId,
    onCallEnd,
    isIncoming = false
}: VideoCallProps) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null)
    const [client, setClient] = useState<StreamVideoClient | null>(null);
    const [call, setCall] = useState<Call | null>(null)

    useEffect(() => {
        let isMounted = true;

        async function initializeVideoCall() {
            try {
                setError(null);
                const { token, userId, userName, userImage } = await getStreamVideoToken();

                if (!isMounted) return;

                const videoClient = new StreamVideoClient({
                    apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
                    user: {
                        id: userId!,
                        name: userName!,
                        image: userImage!
                    },
                    token,
                });

                if (!isMounted) return;

                const videoCall = videoClient.call("default", callId);

                // Join the call
                await videoCall.join({ create: true });

                if (!isMounted) return;

                setClient(videoClient);
                setCall(videoCall);

            } catch (error) {
                console.error("Video call error:", error);
                setError("Failed to initiate call");
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        initializeVideoCall();

        return () => {
            isMounted = false;
            if (call) {
                call.leave().catch(console.error);
            }
            if (client) {
                client.disconnectUser();
            }
        };
    }, [callId]);

    const handleCallEnd = () => {
        if (call) {
            call.leave().catch(console.error);
        }
        if (client) {
            client.disconnectUser();
        }
        onCallEnd();
    };

    if (loading) {
        return (
            <LoadingState data={"Loading your Cideo Call..."}/>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                <div className="text-center text-white max-w-md mx-auto p-8">
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">❌</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Call Error</h3>
                    <p className="text-gray-300 mb-4">{error}</p>
                    <button
                        onClick={handleCallEnd}
                        className="bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold py-3 px-6 rounded-full hover:from-pink-600 hover:to-red-600 transition-all duration-200"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    if (!client || !call) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black z-50">
            <StreamVideo client={client}>
                <StreamCall call={call}>
                    <StreamTheme>
                        <div className="h-screen w-screen">
                            <SpeakerLayout />
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                                <CallControls onLeave={handleCallEnd} />
                            </div>
                        </div>
                    </StreamTheme>
                </StreamCall>
            </StreamVideo>
        </div>
    );
}

export default VideoCall;