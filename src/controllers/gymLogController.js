const { supabase } = require('../config/database');

class GymLogController {
  // Create a new gym log entry
  static async createGymLog(req, res) {
    try {
      const { exercise, sets, reps, weight, notes, user_id } = req.body;

      const { data, error } = await supabase
        .from('gym_logs')
        .insert([
          {
            exercise,
            sets,
            reps,
            weight,
            notes,
            user_id,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      res.status(201).json({
        success: true,
        message: 'Gym log created successfully',
        data
      });
    } catch (error) {
      console.error('Create gym log error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating gym log',
        error: error.message
      });
    }
  }

  // Get all gym logs with pagination and filtering
  static async getAllGymLogs(req, res) {
    try {
      const { page = 1, limit = 10, user_id, exercise } = req.query;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('gym_logs')
        .select(`
          *,
          users!inner(name, email)
        `, { count: 'exact' });

      // Filter by user_id if provided
      if (user_id) {
        query = query.eq('user_id', user_id);
      }

      // Filter by exercise if provided
      if (exercise) {
        query = query.ilike('exercise', `%${exercise}%`);
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
      console.error('Get gym logs error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching gym logs',
        error: error.message
      });
    }
  }

  // Get gym log by ID
  static async getGymLogById(req, res) {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from('gym_logs')
        .select(`
          *,
          users!inner(name, email)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            success: false,
            message: 'Gym log not found'
          });
        }
        throw error;
      }

      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Get gym log error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching gym log',
        error: error.message
      });
    }
  }

  // Update gym log
  static async updateGymLog(req, res) {
    try {
      const { id } = req.params;
      const { exercise, sets, reps, weight, notes } = req.body;

      const updateData = {
        updated_at: new Date().toISOString()
      };

      if (exercise) updateData.exercise = exercise;
      if (sets) updateData.sets = sets;
      if (reps) updateData.reps = reps;
      if (weight) updateData.weight = weight;
      if (notes !== undefined) updateData.notes = notes;

      const { data, error } = await supabase
        .from('gym_logs')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            success: false,
            message: 'Gym log not found'
          });
        }
        throw error;
      }

      res.status(200).json({
        success: true,
        message: 'Gym log updated successfully',
        data
      });
    } catch (error) {
      console.error('Update gym log error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating gym log',
        error: error.message
      });
    }
  }

  // Delete gym log
  static async deleteGymLog(req, res) {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from('gym_logs')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      res.status(200).json({
        success: true,
        message: 'Gym log deleted successfully'
      });
    } catch (error) {
      console.error('Delete gym log error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting gym log',
        error: error.message
      });
    }
  }

  // Get gym log statistics for a user
  static async getGymLogStats(req, res) {
    try {
      const { user_id } = req.params;

      // Get total logs count
      const { count: totalLogs } = await supabase
        .from('gym_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user_id);

      // Get unique exercises count
      const { data: uniqueExercises } = await supabase
        .from('gym_logs')
        .select('exercise')
        .eq('user_id', user_id);

      const uniqueExercisesCount = [...new Set(uniqueExercises?.map(log => log.exercise))].length;

      // Get recent logs (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count: recentLogs } = await supabase
        .from('gym_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user_id)
        .gte('created_at', sevenDaysAgo.toISOString());

      res.status(200).json({
        success: true,
        data: {
          totalLogs: totalLogs || 0,
          uniqueExercises: uniqueExercisesCount || 0,
          recentLogs: recentLogs || 0
        }
      });
    } catch (error) {
      console.error('Get gym log stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching gym log statistics',
        error: error.message
      });
    }
  }
}

module.exports = GymLogController;