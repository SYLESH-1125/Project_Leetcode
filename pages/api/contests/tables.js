// pages/api/contests/tables.js - API route for managing dynamic contest tables
import DynamicTableManager from '../../../lib/dynamic-table-manager.js'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const tableManager = new DynamicTableManager()
      
      // Get all contest tables
      const tables = await tableManager.getAllContestTables()
      
      // Get statistics for each table
      const tablesWithStats = await Promise.all(
        tables.map(async (table) => {
          const stats = await tableManager.getTableStats(table.table_name)
          return {
            ...table,
            stats
          }
        })
      )
      
      res.status(200).json({
        tables: tablesWithStats,
        total: tablesWithStats.length,
        message: 'Contest tables retrieved successfully'
      })
    } catch (error) {
      console.error('Error fetching contest tables:', error)
      res.status(500).json({ error: 'Failed to fetch contest tables' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).json({ error: 'Method not allowed' })
  }
}
