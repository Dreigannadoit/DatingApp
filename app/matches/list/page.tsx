"use client"

import { UserProfile } from '@/app/profile/page';
import LoadingState from '@/components/LoadingState';
import { getUserMatches } from '@/lib/actions/matches';
import { calculateAge } from '@/lib/helpers/calculate-age';
import { User } from '@supabase/supabase-js'
import Link from 'next/link';
import React, { useEffect, useState } from 'react'

const MatchesListPage = () => {
    const [matches, setMatches] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null)
    const [showMatchPopUp, setShowMatchPopUp] = useState(false)
    const [matchPopUpInfo, setMatchPopUpInfo] = useState<UserProfile | null>(null)

    const handleMatchPopUp = (matchInfo: UserProfile) => {
        setShowMatchPopUp(true)
        setMatchPopUpInfo(matchInfo)
    }

    const handleMatchPopUpExit = () => {
        setShowMatchPopUp(false)
        setMatchPopUpInfo(null)
    }

    useEffect(() => {
        async function loadMatches() {
            try {
                const userMatches = await getUserMatches()
                setMatches(userMatches)
                console.log(userMatches)

            } catch (error) {

            } finally {
                setLoading(false)
            }
        }

        loadMatches()
    }, [])

    if (loading) {
        return (
            <LoadingState data={"Loading your matches..."}/>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-8">
                <header className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Your Matches
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {matches.length} match{matches.length !== 1 ? "es" : ""}
                    </p>
                </header>
            </div>

            {matches.length === 0 ? (
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">💕</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        No matches yet
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Start swiping to find your perfect match!
                    </p>
                    <Link
                        href="/matches"
                        className="bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold py-3 px-6 rounded-full hover:from-pink-600 hover:to-red-600 transition-all duration-200"
                    >
                        Start Swiping
                    </Link>
                </div>
            ) : (
                <>
                    <div className="max-w-2xl mx-auto">
                        <div className="grid gap-4">
                            {matches.map((match, key) => (
                                <button
                                    key={key}
                                    // href={`/chat/${match.id}`}
                                    onClick={() => handleMatchPopUp(match)}
                                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                                            <img
                                                src={match.avatar_url}
                                                alt={match.full_name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0 text-left">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {match.full_name}, {calculateAge(match.birthdate)}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                @{match.username}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                {match.bio}
                                            </p>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {showMatchPopUp && (
                        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">

                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                                <div className='flex items-center space-x-6'>
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full overflow-hidden">
                                            <img
                                                src={matchPopUpInfo?.avatar_url || "/avtr_def.png"}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                            {matchPopUpInfo?.full_name}, {calculateAge(matchPopUpInfo?.birthdate!)}
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                                            @{matchPopUpInfo?.username}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-500">
                                            Member since{" "}
                                            {new Date(matchPopUpInfo?.created_at!).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6 mt-5">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                            About Me
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                            {matchPopUpInfo?.bio || "No bio added yet."}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                            Basic Information
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Gender
                                                </label>
                                                <p className="text-gray-900 dark:text-white capitalize">
                                                    {matchPopUpInfo?.gender}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Birthday
                                                </label>
                                                <p className="text-gray-900 dark:text-white">
                                                    {new Date(matchPopUpInfo?.birthdate!).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                            Dating Preferences
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Age Range
                                                </label>
                                                <p className="text-gray-900 dark:text-white">
                                                    {matchPopUpInfo?.preferences.age_range.min} -{" "}
                                                    {matchPopUpInfo?.preferences.age_range.max} years
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Distance
                                                </label>
                                                <p className="text-gray-900 dark:text-white">
                                                    Up to {matchPopUpInfo?.preferences.distance} km
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex space-x-4 mt-10">
                                    <Link
                                        href={`/chat/${matchPopUpInfo?.id}`}
                                        className=" flex-1 bg-green-500 text-white py-3 px-6 rounded-full font-semibold hover:bg-green-600 transition-colors duration-200 text-center"
                                    >
                                        Chat
                                    </Link>
                                    <button
                                        onClick={handleMatchPopUpExit}
                                        className="flex-1 bg-red-500 text-white py-3 px-6 rounded-full font-semibold hover:bg-red-600 transition-colors duration-200"
                                    >
                                        Back
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default MatchesListPage