const { supabase } = require('../config/database');
const { BODY_PARTS, EXERCISE_TYPES, DIFFICULTY_LEVELS } = require('../constants/exercise');
const ExerciseUtils = require('../utils/exerciseUtils');

class ExerciseController {
  // Create a new exercise
  static async createExercise(req, res) {
    try {
      const { 
        id, 
        name, 
        description, 
        body_part, 
        exercise_type, 
        difficulty, 
        equipment 
      } = req.body;

      // Check if exercise with this name already exists
      const { data: existingExercise } = await supabase
        .from('exercises')
        .select('id')
        .eq('name', name)
        .single();

      if (existingExercise) {
        return res.status(400).json({
          success: false,
          message: 'Exercise with this name already exists'
        });
      }

      // Format exercise data for database
      const exerciseData = ExerciseUtils.formatExerciseForDatabase({
        id,
        name,
        description,
        body_part,
        exercise_type,
        difficulty,
        equipment
      });

      // Create exercise
      const { data, error } = await supabase
        .from('exercises')
        .insert([exerciseData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Format response data
      const formattedData = ExerciseUtils.formatExerciseResponse(data);

      res.status(201).json({
        success: true,
        message: 'Exercise created successfully',
        data: formattedData
      });
    } catch (error) {
      console.error('Create exercise error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating exercise',
        error: error.message
      });
    }
  }

  // Get all exercises with filtering and pagination
  static async getAllExercises(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        body_part, 
        exercise_type, 
        difficulty, 
        search 
      } = req.query;
      
      const offset = (page - 1) * limit;

      let query = supabase
        .from('exercises')
        .select('*', { count: 'exact' });

      // Apply filters
      if (body_part) {
        query = query.eq('body_part', body_part);
      }

      if (exercise_type) {
        query = query.eq('exercise_type', exercise_type);
      }

      if (difficulty) {
        query = query.eq('difficulty', difficulty);
      }

      // Add search functionality
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data, error, count } = await query
        .range(offset, offset + limit - 1)
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      // Format response data
      const processedData = data.map(exercise => ExerciseUtils.formatExerciseResponse(exercise));

      res.status(200).json({
        success: true,
        data: processedData,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Get exercises error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching exercises',
        error: error.message
      });
    }
  }

  // Get exercise by ID
  static async getExerciseById(req, res) {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            success: false,
            message: 'Exercise not found'
          });
        }
        throw error;
      }

      // Format response data
      const formattedData = ExerciseUtils.formatExerciseResponse(data);

      res.status(200).json({
        success: true,
        data: formattedData
      });
    } catch (error) {
      console.error('Get exercise error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching exercise',
        error: error.message
      });
    }
  }

  // Update exercise
  static async updateExercise(req, res) {
    try {
      const { id } = req.params;
      const { 
        name, 
        description, 
        body_part, 
        exercise_type, 
        difficulty, 
        equipment 
      } = req.body;

      // Check if exercise exists
      const { data: existingExercise, error: checkError } = await supabase
        .from('exercises')
        .select('id')
        .eq('id', id)
        .single();

      if (checkError && checkError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Exercise not found'
        });
      }

      // If name is being updated, check for uniqueness
      if (name) {
        const { data: nameCheck } = await supabase
          .from('exercises')
          .select('id')
          .eq('name', name)
          .neq('id', id)
          .single();

        if (nameCheck) {
          return res.status(400).json({
            success: false,
            message: 'Exercise with this name already exists'
          });
        }
      }

      const updateData = {
        updated_at: new Date().toISOString()
      };

      if (name) updateData.name = name;
      if (description) updateData.description = description;
      if (body_part) updateData.body_part = body_part;
      if (exercise_type) updateData.exercise_type = exercise_type;
      if (difficulty) updateData.difficulty = difficulty;
      if (equipment !== undefined) {
        updateData.equipment = equipment ? JSON.stringify(equipment) : null;
      }

      const { data, error } = await supabase
        .from('exercises')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Parse equipment array
      if (data.equipment) {
        data.equipment = JSON.parse(data.equipment);
      }

      res.status(200).json({
        success: true,
        message: 'Exercise updated successfully',
        data
      });
    } catch (error) {
      console.error('Update exercise error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating exercise',
        error: error.message
      });
    }
  }

  // Get exercises grouped by body part
  static async getExercisesByBodyPart(req, res) {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('body_part', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      // Process and group by body part
      const processedData = data.map(exercise => ExerciseUtils.formatExerciseResponse(exercise));
      const groupedExercises = ExerciseUtils.groupExercisesByBodyPart(processedData);

      res.status(200).json({
        success: true,
        data: groupedExercises
      });
    } catch (error) {
      console.error('Get exercises by body part error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching exercises by body part',
        error: error.message
      });
    }
  }

  // Get unique values for filters (body parts, exercise types, difficulties)
  static async getExerciseFilters(req, res) {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('body_part, exercise_type, difficulty');

      if (error) {
        throw error;
      }

      const bodyParts = [...new Set(data.map(item => item.body_part))].sort();
      const exerciseTypes = [...new Set(data.map(item => item.exercise_type))].sort();
      const difficulties = [...new Set(data.map(item => item.difficulty).filter(Boolean))].sort();

      res.status(200).json({
        success: true,
        data: {
          body_parts: bodyParts,
          exercise_types: exerciseTypes,
          difficulties: difficulties
        }
      });
    } catch (error) {
      console.error('Get exercise filters error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching exercise filters',
        error: error.message
      });
    }
  }

  // Get exercise statistics
  static async getExerciseStats(req, res) {
    try {
      const { count: totalExercises } = await supabase
        .from('exercises')
        .select('*', { count: 'exact', head: true });

      // Get count by body part
      const { data: bodyPartData } = await supabase
        .from('exercises')
        .select('body_part');

      const bodyPartCounts = bodyPartData?.reduce((acc, item) => {
        acc[item.body_part] = (acc[item.body_part] || 0) + 1;
        return acc;
      }, {}) || {};

      // Get count by exercise type
      const { data: typeData } = await supabase
        .from('exercises')
        .select('exercise_type');

      const typeCounts = typeData?.reduce((acc, item) => {
        acc[item.exercise_type] = (acc[item.exercise_type] || 0) + 1;
        return acc;
      }, {}) || {};

      res.status(200).json({
        success: true,
        data: {
          total_exercises: totalExercises || 0,
          by_body_part: bodyPartCounts,
          by_exercise_type: typeCounts
        }
      });
    } catch (error) {
      console.error('Get exercise stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching exercise statistics',
        error: error.message
      });
    }
  }

  // Get exercise constants (for frontend forms and validation)
  static async getExerciseConstants(req, res) {
    try {
      const constants = ExerciseUtils.getConstants();
      
      res.status(200).json({
        success: true,
        data: {
          body_parts: constants.BODY_PARTS,
          exercise_types: constants.EXERCISE_TYPES,
          difficulty_levels: constants.DIFFICULTY_LEVELS,
          common_equipment: constants.COMMON_EQUIPMENT
        }
      });
    } catch (error) {
      console.error('Get exercise constants error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching exercise constants',
        error: error.message
      });
    }
  }
}

module.exports = ExerciseController;