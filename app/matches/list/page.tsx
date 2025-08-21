import { UserProfile } from '@/app/profile/page';
import { getUserMatches } from '@/lib/actions/matches';
import { User } from '@supabase/supabase-js'
import React, { useEffect, useState } from 'react'

const MatchesListPage = () => {
    const [matches, setMatches] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadMatches() {
            try {
                const userMatches = await getUserMatches()
                setMatches(userMatches)
                
            } catch (error) {

            } finally {
                setLoading(false)
            }
        }
    }, [])

    return (
        <div>

        </div>
    )
}

export default MatchesListPage