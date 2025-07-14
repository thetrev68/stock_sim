// file: src/constants/simulation-status.js
// Simulation status constants extracted from multiple files

// Core status values
export const SIMULATION_STATUS = {
    PENDING: 'pending',
    ACTIVE: 'active', 
    ENDED: 'ended'
};

// Member status values
export const MEMBER_STATUS = {
    ACTIVE: 'active',
    REMOVED: 'removed'
};

// Status display configurations
export const STATUS_CONFIG = {
    [SIMULATION_STATUS.ACTIVE]: {
        text: 'Active',
        color: 'text-green-400',
        bgClass: 'bg-green-600',
        statusClass: 'bg-green-600 text-white'
    },
    [SIMULATION_STATUS.PENDING]: {
        text: 'Pending',
        color: 'text-yellow-400', 
        bgClass: 'bg-yellow-600',
        statusClass: 'bg-yellow-600 text-white'
    },
    [SIMULATION_STATUS.ENDED]: {
        text: 'Ended',
        color: 'text-red-400',
        bgClass: 'bg-red-600', 
        statusClass: 'bg-gray-600 text-gray-300'
    }
};

// Special pending states
export const PENDING_STATES = {
    UPCOMING: {
        text: 'Upcoming',
        color: 'text-yellow-400',
        bgClass: 'bg-yellow-600'
    },
    STARTING_SOON: {
        text: 'Starting Soon', 
        color: 'text-cyan-400',
        bgClass: 'bg-cyan-600'
    }
};

// User roles
export const USER_ROLES = {
    CREATOR: 'creator',
    MEMBER: 'member'
};

// Role display configurations  
export const ROLE_CONFIG = {
    [USER_ROLES.CREATOR]: {
        text: 'Creator',
        color: 'text-cyan-400 bg-cyan-400/10'
    },
    [USER_ROLES.MEMBER]: {
        text: 'Member', 
        color: 'text-gray-400 bg-gray-400/10'
    }
};