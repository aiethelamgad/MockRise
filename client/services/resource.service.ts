import { apiClient } from './api/client';
import { API_ENDPOINTS } from './api/endpoints';

export type ResourceType = 'guide' | 'video' | 'question_bank' | 'course' | 'article';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Resource {
    _id: string;
    resourceType: ResourceType;
    title: string;
    description: string;
    difficulty: DifficultyLevel;
    category: string;
    subcategory?: string | null;
    contentUrl: string | null;
    thumbnailUrl?: string | null;
    createdBy?: {
        _id: string;
        name?: string;
        email: string;
    } | null;
    tags: string[];
    duration?: string;
    views: number;
    rating: number;
    author?: string;
    questionText?: string;
    answerSample?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ResourcesResponse {
    success: boolean;
    data: Resource[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
    stats: {
        total: number;
        guides: number;
        videos: number;
        question_banks: number;
        courses: number;
        articles: number;
    };
    categoryStats: Array<{
        _id: string;
        count: number;
    }>;
    subcategoryStats?: Array<{
        _id: string;
        subcategories: Array<{
            name: string;
            count: number;
        }>;
    }>;
    difficultyStats: Array<{
        _id: string;
        count: number;
    }>;
}

export interface SingleResourceResponse {
    success: boolean;
    data: Resource;
}

export interface CreateResourceData {
    resourceType: ResourceType;
    title: string;
    description: string;
    difficulty: DifficultyLevel;
    category: string;
    subcategory?: string | null;
    contentUrl: string;
    thumbnailUrl?: string;
    tags?: string[];
    duration?: string;
    author?: string;
    questionText?: string;
    answerSample?: string;
}

export interface UpdateResourceData extends Partial<CreateResourceData> {}

export interface ResourceFilters {
    page?: number;
    limit?: number;
    resourceType?: ResourceType | 'all';
    category?: string | 'all';
    subcategory?: string | 'all';
    difficulty?: DifficultyLevel | 'all';
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

/**
 * Resource Service
 */
export const resourceService = {
    /**
     * Get all resources with filtering and pagination
     */
    async getResources(filters: ResourceFilters = {}): Promise<ResourcesResponse> {
        const params = new URLSearchParams();
        
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.resourceType && filters.resourceType !== 'all') {
            params.append('resourceType', filters.resourceType);
        }
        if (filters.category && filters.category !== 'all') {
            params.append('category', filters.category);
        }
        if (filters.subcategory && filters.subcategory !== 'all') {
            params.append('subcategory', filters.subcategory);
        }
        if (filters.difficulty && filters.difficulty !== 'all') {
            params.append('difficulty', filters.difficulty);
        }
        if (filters.search) params.append('search', filters.search);
        if (filters.sortBy) params.append('sortBy', filters.sortBy);
        if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

        return apiClient.get<ResourcesResponse>(
            `${API_ENDPOINTS.resources.getAll}?${params.toString()}`
        );
    },

    /**
     * Get a single resource by ID
     */
    async getResource(id: string): Promise<SingleResourceResponse> {
        return apiClient.get<SingleResourceResponse>(API_ENDPOINTS.resources.getById(id));
    },

    /**
     * Create a new resource
     */
    async createResource(resourceData: CreateResourceData): Promise<SingleResourceResponse> {
        return apiClient.post<SingleResourceResponse>(
            API_ENDPOINTS.resources.create,
            resourceData
        );
    },

    /**
     * Update an existing resource
     */
    async updateResource(
        id: string,
        resourceData: UpdateResourceData
    ): Promise<SingleResourceResponse> {
        return apiClient.put<SingleResourceResponse>(
            API_ENDPOINTS.resources.update(id),
            resourceData
        );
    },

    /**
     * Delete a resource
     */
    async deleteResource(id: string): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(
            API_ENDPOINTS.resources.delete(id)
        );
    },

    /**
     * Increment resource views
     */
    async incrementViews(id: string): Promise<{ success: boolean; data: { views: number; resource?: Resource } }> {
        return apiClient.post<{ success: boolean; data: { views: number; resource?: Resource } }>(
            API_ENDPOINTS.resources.incrementViews(id)
        );
    },
};

