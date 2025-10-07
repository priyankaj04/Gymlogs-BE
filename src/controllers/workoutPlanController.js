const { supabase } = require('../config/database');
const { BODY_PARTS, DIFFICULTY_LEVELS } = require('../constants/exercise');

class WorkoutPlanController {
  // Create a new workout plan with exercises
  static async createWorkoutPlan(req, res) {
    try {
      const { 
        name, 
        description, 
        muscle_types, 
        difficulty_level, 
        estimated_duration, 
        is_public = false,
        exercises 
      } = req.body;

      const created_by = req.user.id; // From auth middleware

      // Start a transaction-like approach using multiple queries
      // Create the workout plan first
      const { data: workoutPlan, error: planError } = await supabase
        .from('workout_plans')
        .insert([
          {
            name,
            description,
            muscle_types,
            difficulty_level,
            estimated_duration,
            created_by,
            is_public,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (planError) {
        throw planError;
      }

      // Add exercises to the workout plan
      const exercisePromises = exercises.map((exercise, index) => {
        return supabase
          .from('workout_plan_exercises')
          .insert([
            {
              workout_plan_id: workoutPlan.id,
              exercise_id: exercise.exercise_id,
              sets: exercise.sets,
              reps: exercise.reps,
              weight: exercise.weight || null,
              rest_time: exercise.rest_time || null,
              notes: exercise.notes || null,
              order_index: exercise.order_index || (index + 1),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ])
          .select();
      });

      const exerciseResults = await Promise.all(exercisePromises);
      
      // Check for errors in exercise insertions
      const exerciseErrors = exerciseResults.filter(result => result.error);
      if (exerciseErrors.length > 0) {
        // Rollback by deleting the created workout plan
        await supabase.from('workout_plans').delete().eq('id', workoutPlan.id);
        throw new Error('Failed to add exercises to workout plan');
      }

      // Fetch the complete workout plan with exercises
      const completeWorkoutPlan = await WorkoutPlanController.getWorkoutPlanWithExercises(workoutPlan.id);

      res.status(201).json({
        success: true,
        message: 'Workout plan created successfully',
        data: completeWorkoutPlan
      });
    } catch (error) {
      console.error('Create workout plan error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating workout plan',
        error: error.message
      });
    }
  }

  // Get all workout plans with filtering and pagination
  static async getAllWorkoutPlans(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        muscle_type,
        difficulty_level,
        created_by,
        is_public,
        search 
      } = req.query;
      
      const offset = (page - 1) * limit;
      const currentUserId = req.user.id;

      let query = supabase
        .from('workout_plans')
        .select(`
          *,
          users!inner(name, email)
        `, { count: 'exact' });

      // Apply RLS-compliant filtering - show user's own plans and public plans
      query = query.or(`created_by.eq.${currentUserId},is_public.eq.true`);

      // Apply additional filters
      if (muscle_type) {
        query = query.contains('muscle_types', [muscle_type]);
      }

      if (difficulty_level) {
        query = query.eq('difficulty_level', difficulty_level);
      }

      if (created_by) {
        query = query.eq('created_by', created_by);
      }

      if (is_public !== undefined) {
        query = query.eq('is_public', is_public === 'true');
      }

      // Add search functionality
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data, error, count } = await query
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      res.status(200).json({
        success: true,
        data,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Get workout plans error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching workout plans',
        error: error.message
      });
    }
  }

  // Get workout plan by ID with exercises
  static async getWorkoutPlanById(req, res) {
    try {
      const { id } = req.params;
      const workoutPlan = await WorkoutPlanController.getWorkoutPlanWithExercises(id);

      if (!workoutPlan) {
        return res.status(404).json({
          success: false,
          message: 'Workout plan not found'
        });
      }

      res.status(200).json({
        success: true,
        data: workoutPlan
      });
    } catch (error) {
      console.error('Get workout plan error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching workout plan',
        error: error.message
      });
    }
  }

  // Helper method to get workout plan with exercises
  static async getWorkoutPlanWithExercises(planId) {
    try {
      // Get workout plan details
      const { data: plan, error: planError } = await supabase
        .from('workout_plans')
        .select(`
          *,
          users!inner(name, email)
        `)
        .eq('id', planId)
        .single();

      if (planError) {
        if (planError.code === 'PGRST116') {
          return null;
        }
        throw planError;
      }

      // Get exercises for this workout plan
      const { data: exercises, error: exercisesError } = await supabase
        .from('workout_plan_exercises')
        .select(`
          *,
          exercises!inner(*)
        `)
        .eq('workout_plan_id', planId)
        .order('order_index', { ascending: true });

      if (exercisesError) {
        throw exercisesError;
      }

      // Format exercises data
      const formattedExercises = exercises.map(wpe => ({
        id: wpe.id,
        exercise_id: wpe.exercise_id,
        exercise_name: wpe.exercises.name,
        exercise_description: wpe.exercises.description,
        body_part: wpe.exercises.body_part,
        exercise_type: wpe.exercises.exercise_type,
        difficulty: wpe.exercises.difficulty,
        equipment: wpe.exercises.equipment ? JSON.parse(wpe.exercises.equipment) : null,
        sets: wpe.sets,
        reps: wpe.reps,
        weight: wpe.weight,
        rest_time: wpe.rest_time,
        notes: wpe.notes,
        order_index: wpe.order_index
      }));

      return {
        ...plan,
        exercises: formattedExercises
      };
    } catch (error) {
      throw error;
    }
  }

  // Update workout plan
  static async updateWorkoutPlan(req, res) {
    try {
      const { id } = req.params;
      const { 
        name, 
        description, 
        muscle_types, 
        difficulty_level, 
        estimated_duration, 
        is_public,
        exercises 
      } = req.body;

      // Check if workout plan exists and user has permission
      const { data: existingPlan, error: checkError } = await supabase
        .from('workout_plans')
        .select('id, created_by')
        .eq('id', id)
        .single();

      if (checkError && checkError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Workout plan not found'
        });
      }

      if (existingPlan.created_by !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own workout plans'
        });
      }

      // Update workout plan
      const updateData = {
        updated_at: new Date().toISOString()
      };

      if (name) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (muscle_types) updateData.muscle_types = muscle_types;
      if (difficulty_level) updateData.difficulty_level = difficulty_level;
      if (estimated_duration) updateData.estimated_duration = estimated_duration;
      if (is_public !== undefined) updateData.is_public = is_public;

      const { error: updateError } = await supabase
        .from('workout_plans')
        .update(updateData)
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      // Update exercises if provided
      if (exercises) {
        // Delete existing exercises
        await supabase
          .from('workout_plan_exercises')
          .delete()
          .eq('workout_plan_id', id);

        // Add new exercises
        const exercisePromises = exercises.map((exercise, index) => {
          return supabase
            .from('workout_plan_exercises')
            .insert([
              {
                workout_plan_id: id,
                exercise_id: exercise.exercise_id,
                sets: exercise.sets,
                reps: exercise.reps,
                weight: exercise.weight || null,
                rest_time: exercise.rest_time || null,
                notes: exercise.notes || null,
                order_index: exercise.order_index || (index + 1),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ]);
        });

        await Promise.all(exercisePromises);
      }

      // Fetch updated workout plan with exercises
      const updatedWorkoutPlan = await WorkoutPlanController.getWorkoutPlanWithExercises(id);

      res.status(200).json({
        success: true,
        message: 'Workout plan updated successfully',
        data: updatedWorkoutPlan
      });
    } catch (error) {
      console.error('Update workout plan error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating workout plan',
        error: error.message
      });
    }
  }

  // Delete workout plan
  static async deleteWorkoutPlan(req, res) {
    try {
      const { id } = req.params;

      // Check if workout plan exists and user has permission
      const { data: existingPlan, error: checkError } = await supabase
        .from('workout_plans')
        .select('id, created_by')
        .eq('id', id)
        .single();

      if (checkError && checkError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Workout plan not found'
        });
      }

      if (existingPlan.created_by !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own workout plans'
        });
      }

      // Delete workout plan (exercises will be deleted automatically due to CASCADE)
      const { error } = await supabase
        .from('workout_plans')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      res.status(200).json({
        success: true,
        message: 'Workout plan deleted successfully'
      });
    } catch (error) {
      console.error('Delete workout plan error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting workout plan',
        error: error.message
      });
    }
  }

  // Add exercise to workout plan
  static async addExerciseToWorkoutPlan(req, res) {
    try {
      const { planId } = req.params;
      const { exercise_id, sets, reps, weight, rest_time, notes, order_index } = req.body;

      // Check if workout plan exists and user has permission
      const { data: existingPlan, error: checkError } = await supabase
        .from('workout_plans')
        .select('id, created_by')
        .eq('id', planId)
        .single();

      if (checkError && checkError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Workout plan not found'
        });
      }

      if (existingPlan.created_by !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only modify your own workout plans'
        });
      }

      // Check if exercise already exists in the plan
      const { data: existingExercise } = await supabase
        .from('workout_plan_exercises')
        .select('id')
        .eq('workout_plan_id', planId)
        .eq('exercise_id', exercise_id)
        .single();

      if (existingExercise) {
        return res.status(400).json({
          success: false,
          message: 'Exercise already exists in this workout plan'
        });
      }

      // Get next order index if not provided
      const finalOrderIndex = order_index || await WorkoutPlanController.getNextOrderIndex(planId);

      // Add exercise to workout plan
      const { data, error } = await supabase
        .from('workout_plan_exercises')
        .insert([
          {
            workout_plan_id: planId,
            exercise_id,
            sets,
            reps,
            weight: weight || null,
            rest_time: rest_time || null,
            notes: notes || null,
            order_index: finalOrderIndex,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select(`
          *,
          exercises!inner(*)
        `)
        .single();

      if (error) {
        throw error;
      }

      // Format response
      const formattedExercise = {
        id: data.id,
        exercise_id: data.exercise_id,
        exercise_name: data.exercises.name,
        exercise_description: data.exercises.description,
        body_part: data.exercises.body_part,
        exercise_type: data.exercises.exercise_type,
        difficulty: data.exercises.difficulty,
        equipment: data.exercises.equipment ? JSON.parse(data.exercises.equipment) : null,
        sets: data.sets,
        reps: data.reps,
        weight: data.weight,
        rest_time: data.rest_time,
        notes: data.notes,
        order_index: data.order_index
      };

      res.status(201).json({
        success: true,
        message: 'Exercise added to workout plan successfully',
        data: formattedExercise
      });
    } catch (error) {
      console.error('Add exercise to workout plan error:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding exercise to workout plan',
        error: error.message
      });
    }
  }

  // Update exercise in workout plan
  static async updateExerciseInWorkoutPlan(req, res) {
    try {
      const { planId, exerciseId } = req.params;
      const { sets, reps, weight, rest_time, notes, order_index } = req.body;

      // Check if workout plan exists and user has permission
      const { data: existingPlan, error: checkError } = await supabase
        .from('workout_plans')
        .select('id, created_by')
        .eq('id', planId)
        .single();

      if (checkError && checkError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Workout plan not found'
        });
      }

      if (existingPlan.created_by !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only modify your own workout plans'
        });
      }

      // Update the exercise
      const updateData = {
        updated_at: new Date().toISOString()
      };

      if (sets) updateData.sets = sets;
      if (reps) updateData.reps = reps;
      if (weight !== undefined) updateData.weight = weight;
      if (rest_time !== undefined) updateData.rest_time = rest_time;
      if (notes !== undefined) updateData.notes = notes;
      if (order_index) updateData.order_index = order_index;

      const { data, error } = await supabase
        .from('workout_plan_exercises')
        .update(updateData)
        .eq('id', exerciseId)
        .eq('workout_plan_id', planId)
        .select(`
          *,
          exercises!inner(*)
        `)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            success: false,
            message: 'Exercise not found in workout plan'
          });
        }
        throw error;
      }

      // Format response
      const formattedExercise = {
        id: data.id,
        exercise_id: data.exercise_id,
        exercise_name: data.exercises.name,
        exercise_description: data.exercises.description,
        body_part: data.exercises.body_part,
        exercise_type: data.exercises.exercise_type,
        difficulty: data.exercises.difficulty,
        equipment: data.exercises.equipment ? JSON.parse(data.exercises.equipment) : null,
        sets: data.sets,
        reps: data.reps,
        weight: data.weight,
        rest_time: data.rest_time,
        notes: data.notes,
        order_index: data.order_index
      };

      res.status(200).json({
        success: true,
        message: 'Exercise updated successfully',
        data: formattedExercise
      });
    } catch (error) {
      console.error('Update exercise in workout plan error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating exercise in workout plan',
        error: error.message
      });
    }
  }

  // Remove exercise from workout plan
  static async removeExerciseFromWorkoutPlan(req, res) {
    try {
      const { planId, exerciseId } = req.params;

      // Check if workout plan exists and user has permission
      const { data: existingPlan, error: checkError } = await supabase
        .from('workout_plans')
        .select('id, created_by')
        .eq('id', planId)
        .single();

      if (checkError && checkError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Workout plan not found'
        });
      }

      if (existingPlan.created_by !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only modify your own workout plans'
        });
      }

      // Delete the exercise from workout plan
      const { error } = await supabase
        .from('workout_plan_exercises')
        .delete()
        .eq('id', exerciseId)
        .eq('workout_plan_id', planId);

      if (error) {
        throw error;
      }

      res.status(200).json({
        success: true,
        message: 'Exercise removed from workout plan successfully'
      });
    } catch (error) {
      console.error('Remove exercise from workout plan error:', error);
      res.status(500).json({
        success: false,
        message: 'Error removing exercise from workout plan',
        error: error.message
      });
    }
  }

  // Get workout plan statistics
  static async getWorkoutPlanStats(req, res) {
    try {
      const userId = req.user.id;

      // Get total workout plans created by user
      const { count: totalPlans } = await supabase
        .from('workout_plans')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', userId);

      // Get public plans count
      const { count: publicPlans } = await supabase
        .from('workout_plans')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', userId)
        .eq('is_public', true);

      // Get plans by difficulty
      const { data: difficultyData } = await supabase
        .from('workout_plans')
        .select('difficulty_level')
        .eq('created_by', userId);

      const difficultyStats = difficultyData?.reduce((acc, item) => {
        if (item.difficulty_level) {
          acc[item.difficulty_level] = (acc[item.difficulty_level] || 0) + 1;
        }
        return acc;
      }, {}) || {};

      // Get most used muscle types
      const { data: muscleData } = await supabase
        .from('workout_plans')
        .select('muscle_types')
        .eq('created_by', userId);

      const muscleStats = {};
      muscleData?.forEach(item => {
        if (item.muscle_types) {
          item.muscle_types.forEach(muscle => {
            muscleStats[muscle] = (muscleStats[muscle] || 0) + 1;
          });
        }
      });

      res.status(200).json({
        success: true,
        data: {
          total_plans: totalPlans || 0,
          public_plans: publicPlans || 0,
          private_plans: (totalPlans || 0) - (publicPlans || 0),
          by_difficulty: difficultyStats,
          muscle_type_usage: muscleStats
        }
      });
    } catch (error) {
      console.error('Get workout plan stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching workout plan statistics',
        error: error.message
      });
    }
  }

  // Helper method to get next order index
  static async getNextOrderIndex(planId) {
    try {
      const { data, error } = await supabase
        .from('workout_plan_exercises')
        .select('order_index')
        .eq('workout_plan_id', planId)
        .order('order_index', { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }

      return data.length > 0 ? data[0].order_index + 1 : 1;
    } catch (error) {
      return 1; // Default to 1 if there's an error
    }
  }
}

module.exports = WorkoutPlanController;