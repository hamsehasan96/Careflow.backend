const { Appointment, Participant, User, CareNote } = require('../models');
const { Op, Sequelize } = require('sequelize');

class AnalyticsService {
  // Get participant statistics
  async getParticipantStats() {
    try {
      // Get participant count by status
      const participantsByStatus = await Participant.findAll({
        attributes: [
          'status',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        group: ['status']
      });

      // Get participant count by gender
      const participantsByGender = await Participant.findAll({
        attributes: [
          'gender',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        group: ['gender']
      });

      // Get participant count by funding type
      const participantsByFundingType = await Participant.findAll({
        attributes: [
          'fundingType',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        group: ['fundingType']
      });

      // Get total participants
      const totalParticipants = await Participant.count();

      // Get new participants in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const newParticipants = await Participant.count({
        where: {
          createdAt: {
            [Op.gte]: thirtyDaysAgo
          }
        }
      });

      return {
        totalParticipants,
        newParticipants,
        participantsByStatus: participantsByStatus.map(p => ({
          status: p.status,
          count: parseInt(p.getDataValue('count'))
        })),
        participantsByGender: participantsByGender.map(p => ({
          gender: p.gender,
          count: parseInt(p.getDataValue('count'))
        })),
        participantsByFundingType: participantsByFundingType.map(p => ({
          fundingType: p.fundingType,
          count: parseInt(p.getDataValue('count'))
        }))
      };
    } catch (error) {
      console.error('Error getting participant stats:', error);
      throw error;
    }
  }

  // Get appointment statistics
  async getAppointmentStats() {
    try {
      // Get appointment count by status
      const appointmentsByStatus = await Appointment.findAll({
        attributes: [
          'status',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        group: ['status']
      });

      // Get appointments by month (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const appointmentsByMonth = await Appointment.findAll({
        attributes: [
          [Sequelize.fn('date_trunc', 'month', Sequelize.col('startTime')), 'month'],
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        where: {
          startTime: {
            [Op.gte]: sixMonthsAgo
          }
        },
        group: [Sequelize.fn('date_trunc', 'month', Sequelize.col('startTime'))],
        order: [[Sequelize.fn('date_trunc', 'month', Sequelize.col('startTime')), 'ASC']]
      });

      // Get total appointments
      const totalAppointments = await Appointment.count();

      // Get upcoming appointments in the next 7 days
      const now = new Date();
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
      
      const upcomingAppointments = await Appointment.count({
        where: {
          startTime: {
            [Op.gte]: now,
            [Op.lt]: sevenDaysLater
          },
          status: {
            [Op.notIn]: ['cancelled', 'no_show']
          }
        }
      });

      return {
        totalAppointments,
        upcomingAppointments,
        appointmentsByStatus: appointmentsByStatus.map(a => ({
          status: a.status,
          count: parseInt(a.getDataValue('count'))
        })),
        appointmentsByMonth: appointmentsByMonth.map(a => {
          const month = new Date(a.getDataValue('month'));
          return {
            month: month.toLocaleString('default', { month: 'short', year: 'numeric' }),
            count: parseInt(a.getDataValue('count'))
          };
        })
      };
    } catch (error) {
      console.error('Error getting appointment stats:', error);
      throw error;
    }
  }

  // Get staff statistics
  async getStaffStats() {
    try {
      // Get staff count by role
      const staffByRole = await User.findAll({
        attributes: [
          'role',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        where: {
          role: {
            [Op.ne]: 'participant'
          }
        },
        group: ['role']
      });

      // Get staff count by status
      const staffByStatus = await User.findAll({
        attributes: [
          'status',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        where: {
          role: {
            [Op.ne]: 'participant'
          }
        },
        group: ['status']
      });

      // Get total staff
      const totalStaff = await User.count({
        where: {
          role: {
            [Op.ne]: 'participant'
          }
        }
      });

      // Get staff with most appointments in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const staffWithMostAppointments = await Appointment.findAll({
        attributes: [
          'staffId',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'appointmentCount']
        ],
        where: {
          startTime: {
            [Op.gte]: thirtyDaysAgo
          }
        },
        include: [
          {
            model: User,
            attributes: ['firstName', 'lastName', 'email']
          }
        ],
        group: ['staffId', 'User.id'],
        order: [[Sequelize.fn('COUNT', Sequelize.col('id')), 'DESC']],
        limit: 5
      });

      return {
        totalStaff,
        staffByRole: staffByRole.map(s => ({
          role: s.role,
          count: parseInt(s.getDataValue('count'))
        })),
        staffByStatus: staffByStatus.map(s => ({
          status: s.status,
          count: parseInt(s.getDataValue('count'))
        })),
        staffWithMostAppointments: staffWithMostAppointments.map(s => ({
          staffId: s.staffId,
          firstName: s.User.firstName,
          lastName: s.User.lastName,
          email: s.User.email,
          appointmentCount: parseInt(s.getDataValue('appointmentCount'))
        }))
      };
    } catch (error) {
      console.error('Error getting staff stats:', error);
      throw error;
    }
  }

  // Get dashboard summary statistics
  async getDashboardSummary() {
    try {
      const now = new Date();
      
      // Get total counts
      const totalParticipants = await Participant.count();
      const totalStaff = await User.count({
        where: {
          role: {
            [Op.ne]: 'participant'
          }
        }
      });
      
      // Get today's appointments
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      
      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);
      
      const todayAppointments = await Appointment.count({
        where: {
          startTime: {
            [Op.gte]: todayStart,
            [Op.lte]: todayEnd
          }
        }
      });
      
      // Get pending invoices
      const pendingInvoices = 7; // Placeholder for actual invoice count
      
      // Get participant status distribution
      const participantStatusData = await Participant.findAll({
        attributes: [
          'status',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        group: ['status']
      });
      
      // Get appointment status distribution
      const appointmentStatusData = await Appointment.findAll({
        attributes: [
          'status',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        group: ['status']
      });
      
      // Get monthly appointments (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const monthlyAppointmentsData = await Appointment.findAll({
        attributes: [
          [Sequelize.fn('date_trunc', 'month', Sequelize.col('startTime')), 'month'],
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        where: {
          startTime: {
            [Op.gte]: sixMonthsAgo
          }
        },
        group: [Sequelize.fn('date_trunc', 'month', Sequelize.col('startTime'))],
        order: [[Sequelize.fn('date_trunc', 'month', Sequelize.col('startTime')), 'ASC']]
      });
      
      return {
        counts: {
          totalParticipants,
          totalStaff,
          todayAppointments,
          pendingInvoices
        },
        charts: {
          participantStatus: participantStatusData.map(p => ({
            name: p.status,
            value: parseInt(p.getDataValue('count'))
          })),
          appointmentStatus: appointmentStatusData.map(a => ({
            name: a.status,
            value: parseInt(a.getDataValue('count'))
          })),
          monthlyAppointments: monthlyAppointmentsData.map(m => {
            const month = new Date(m.getDataValue('month'));
            return {
              name: month.toLocaleString('default', { month: 'short' }),
              count: parseInt(m.getDataValue('count'))
            };
          })
        }
      };
    } catch (error) {
      console.error('Error getting dashboard summary:', error);
      throw error;
    }
  }
}

module.exports = AnalyticsService;
