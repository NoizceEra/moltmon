import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.79.0'
import { corsHeaders } from '../_shared/cors.ts'

interface BattleCompleteRequest {
  battleId: string
  winnerId: string
  attackerDamageDealt: number
  defenderDamageDealt: number
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { battleId, winnerId, attackerDamageDealt, defenderDamageDealt }: BattleCompleteRequest = await req.json()

    // Fetch battle details
    const { data: battle, error: battleError } = await supabase
      .from('battles')
      .select('*, attacker_pet:pets!battles_attacker_pet_id_fkey(level), defender_pet:pets!battles_defender_pet_id_fkey(level)')
      .eq('id', battleId)
      .eq('status', 'active')
      .single()

    if (battleError || !battle) {
      console.error('Battle fetch error:', battleError)
      return new Response(JSON.stringify({ error: 'Battle not found or already completed' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Verify user is part of this battle
    if (battle.attacker_id !== user.id && battle.defender_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Not authorized for this battle' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Calculate rewards server-side
    const won = winnerId === user.id
    const userPetLevel = battle.attacker_id === user.id ? battle.attacker_pet.level : battle.defender_pet.level
    
    // Team size calculation based on damage dealt (rough approximation)
    const teamSize = Math.max(1, Math.floor(attackerDamageDealt / 100) || 1)
    
    const rewards = won ? (50 + userPetLevel * 10) * teamSize : 10
    const experience = won ? (30 + userPetLevel * 5) * teamSize : 5

    console.log('Calculated rewards:', { rewards, experience, won, userPetLevel, teamSize })

    // Update battle record
    const { error: battleUpdateError } = await supabase
      .from('battles')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        winner_id: winnerId,
        rewards_petpoints: rewards,
        rewards_experience: experience,
        attacker_damage_dealt: attackerDamageDealt,
        defender_damage_dealt: defenderDamageDealt
      })
      .eq('id', battleId)

    if (battleUpdateError) {
      console.error('Battle update error:', battleUpdateError)
      return new Response(JSON.stringify({ error: 'Failed to update battle' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Update user profile with rewards
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('pet_points')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError)
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({ pet_points: profile.pet_points + rewards })
      .eq('id', user.id)

    if (profileUpdateError) {
      console.error('Profile update error:', profileUpdateError)
      return new Response(JSON.stringify({ error: 'Failed to update profile' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Update pet experience
    const petId = battle.attacker_id === user.id ? battle.attacker_pet_id : battle.defender_pet_id
    const { data: pet, error: petError } = await supabase
      .from('pets')
      .select('experience, level')
      .eq('id', petId)
      .single()

    if (!petError && pet) {
      const newExperience = pet.experience + experience
      const experienceNeeded = pet.level * 100
      const newLevel = newExperience >= experienceNeeded ? pet.level + 1 : pet.level

      await supabase
        .from('pets')
        .update({
          experience: newExperience >= experienceNeeded ? newExperience - experienceNeeded : newExperience,
          level: newLevel
        })
        .eq('id', petId)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        rewards, 
        experience,
        won 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in complete-battle function:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
