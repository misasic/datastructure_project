import mysql from 'mysql2/promise';

class DatabaseService {
    constructor() {
        this.pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'buptmap',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    }

    // 获取所有位置点
    async getLocations() {
        try {
            const [rows] = await this.pool.query(`
                SELECT 
                    l.id,
                    l.name,
                    l.latitude as lat,
                    l.longitude as lng,
                    l.description,
                    at.name as type
                FROM locations l
                LEFT JOIN area_types at ON l.area_type_id = at.id
            `);
            return rows;
        } catch (error) {
            console.error('获取位置点失败:', error);
            throw error;
        }
    }

    // 获取两点之间的路径
    async getPath(fromId, toId) {
        try {
            const [rows] = await this.pool.query(`
                SELECT 
                    p.*,
                    ptm.transport_mode_id,
                    tm.name as transport_mode_name,
                    tm.speed as ideal_speed
                FROM paths p
                LEFT JOIN path_transport_modes ptm ON p.id = ptm.path_id
                LEFT JOIN transport_modes tm ON ptm.transport_mode_id = tm.id
                WHERE (p.from_location_id = ? AND p.to_location_id = ?)
                OR (p.from_location_id = ? AND p.to_location_id = ?)
            `, [fromId, toId, toId, fromId]);
            return rows;
        } catch (error) {
            console.error('获取路径失败:', error);
            throw error;
        }
    }

    // 获取区域配置
    async getAreaConfig(areaTypeId) {
        try {
            const [rows] = await this.pool.query(`
                SELECT *
                FROM area_configs
                WHERE area_type_id = ?
            `, [areaTypeId]);
            return rows[0];
        } catch (error) {
            console.error('获取区域配置失败:', error);
            throw error;
        }
    }

    // 获取所有交通方式
    async getTransportModes() {
        try {
            const [rows] = await this.pool.query(`
                SELECT *
                FROM transport_modes
            `);
            return rows;
        } catch (error) {
            console.error('获取交通方式失败:', error);
            throw error;
        }
    }

    // 获取路径的拥挤度
    async getPathCongestion(pathId) {
        try {
            const [rows] = await this.pool.query(`
                SELECT congestion_rate
                FROM paths
                WHERE id = ?
            `, [pathId]);
            return rows[0]?.congestion_rate || 1.0;
        } catch (error) {
            console.error('获取路径拥挤度失败:', error);
            throw error;
        }
    }

    // 更新路径拥挤度
    async updatePathCongestion(pathId, congestionRate) {
        try {
            await this.pool.query(`
                UPDATE paths
                SET congestion_rate = ?
                WHERE id = ?
            `, [congestionRate, pathId]);
        } catch (error) {
            console.error('更新路径拥挤度失败:', error);
            throw error;
        }
    }

    // 获取位置点的详细信息
    async getLocationDetails(locationId) {
        try {
            const [rows] = await this.pool.query(`
                SELECT 
                    l.*,
                    at.name as area_type_name,
                    at.description as area_type_description
                FROM locations l
                LEFT JOIN area_types at ON l.area_type_id = at.id
                WHERE l.id = ?
            `, [locationId]);
            return rows[0];
        } catch (error) {
            console.error('获取位置点详细信息失败:', error);
            throw error;
        }
    }

    // 获取路径可用的交通方式
    async getPathTransportModes(pathId) {
        try {
            const [rows] = await this.pool.query(`
                SELECT 
                    tm.*
                FROM path_transport_modes ptm
                JOIN transport_modes tm ON ptm.transport_mode_id = tm.id
                WHERE ptm.path_id = ?
            `, [pathId]);
            return rows;
        } catch (error) {
            console.error('获取路径交通方式失败:', error);
            throw error;
        }
    }
}

export default new DatabaseService(); 