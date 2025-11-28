
import { Complaint, ComplaintStatus, User, Role, Announcement, Achievement, MuktarStats, Importance } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// MOCK DATA STORE (In-memory for demo)
let achievements: Achievement[] = [
    {
        id: '1',
        title: 'Park Renovation',
        description: 'Renovated the central park.',
        date: '2023-10-15',
        media: [
            { url: 'https://picsum.photos/400/250?random=1', type: 'image' },
            { url: 'https://picsum.photos/400/250?random=2', type: 'image' },
            { url: 'https://picsum.photos/400/250?random=3', type: 'image' },
            { url: 'https://picsum.photos/400/250?random=4', type: 'image' },
            { url: 'https://picsum.photos/400/250?random=5', type: 'image' }
        ]
    }
];

let announcements: Announcement[] = [
    { id: '1', title: 'Electricity Maintenance', description: 'Scheduled outage on Friday 2pm-4pm.', date: '2023-10-26', category: 'Maintenance', isSticky: true },
    { id: '2', title: 'Community Cleanup', description: 'Join us this Saturday for district cleanup.', date: '2023-10-20', category: 'Event', isSticky: false },
];

export const api = {
  async getComplaintByTracking(trackingId: string): Promise<Complaint | null> {
    await delay(800);
    if (trackingId === 'TRK-1234') {
      return {
        id: '1',
        trackingNumber: 'TRK-1234',
        district: 'District 1',
        category: 'Electricity',
        importance: Importance.HIGH,
        title: 'Broken transformer on Main St',
        description: 'The main transformer has been sparking for 2 days. Please fix immediately.',
        status: ComplaintStatus.IN_PROGRESS,
        createdAt: '2023-10-25',
        expectedCompletion: '2023-10-28',
        phoneNumber: '0912345678',
        attachments: ['https://picsum.photos/200/200'],
        muktarNotes: 'Maintenance team dispatched.',
        pinned: false
      } as any;
    }
    return null;
  },

  async getComplaints(role: Role, district?: string): Promise<Complaint[]> {
    await delay(500);
    const base = [
      {
        id: '1',
        trackingNumber: 'TRK-1234',
        title: 'Broken Light',
        category: 'Electricity',
        status: ComplaintStatus.PENDING,
        importance: Importance.LOW,
        district: 'District 1',
        location: 'Main Street, near Al-Zahra Mosque',
        createdAt: '2023-10-01',
        description: 'Street light is not working',
        phoneNumber: '0912345678',
        attachments: [],
        citizenHelp: 'I can show the location',
        assignedMuktarId: 'm1',
        pinned: false
      },
      {
        id: '2',
        trackingNumber: 'TRK-5678',
        title: 'Water Leak',
        category: 'Water',
        status: ComplaintStatus.IN_PROGRESS,
        importance: Importance.HIGH,
        district: 'District 2',
        location: 'Al-Mogambo Street, Building 15',
        createdAt: '2023-10-02',
        description: 'Water leaking from main pipe',
        phoneNumber: '0923456789',
        attachments: ['https://picsum.photos/200/200'],
        citizenHelp: '',
        assignedMuktarId: undefined,
        assignedAdminId: undefined,
        assignedManagerId: 'mgr1',
        pinned: false
      },
      {
        id: '3',
        trackingNumber: 'TRK-9999',
        title: 'Pothole',
        category: 'Roads',
        status: ComplaintStatus.COMPLETED,
        importance: Importance.MEDIUM,
        district: 'District 1',
        location: 'Al-Zahra Highway, KM 2',
        createdAt: '2023-09-25',
        description: 'Large pothole on main road',
        phoneNumber: '0934567890',
        attachments: [],
        citizenHelp: '',
        assignedMuktarId: undefined,
        assignedAdminId: 'a1',
        assignedManagerId: undefined,
        pinned: false
      },
      {
        id: '4',
        trackingNumber: 'TRK-1111',
        title: 'Garbage',
        category: 'Sanitation',
        status: ComplaintStatus.UNDER_REVIEW,
        importance: Importance.LOW,
        district: 'District 3',
        location: 'Al-Furqan Market Area',
        createdAt: '2023-10-05',
        description: 'Garbage not collected for 3 days',
        phoneNumber: '0945678901',
        attachments: [],
        citizenHelp: '',
        assignedMuktarId: 'm3',
        pinned: false
      },
      {
        id: '5',
        trackingNumber: 'TRK-2222',
        title: 'Noise',
        category: 'General',
        status: ComplaintStatus.CLOSED,
        importance: Importance.LOW,
        district: 'District 1',
        location: 'Residential Area, Block A',
        createdAt: '2023-10-06',
        description: 'Loud noise from construction',
        phoneNumber: '0956789012',
        attachments: [],
        citizenHelp: '',
        assignedMuktarId: 'm1',
        pinned: false
      },
      {
        id: '6',
        trackingNumber: 'TRK-3333',
        title: 'Power Outage',
        category: 'Electricity',
        status: ComplaintStatus.PENDING,
        importance: Importance.HIGH,
        district: 'District 1',
        location: 'Industrial Area',
        createdAt: '2023-10-07',
        description: 'Power outage affecting entire block',
        phoneNumber: '0967890123',
        attachments: [],
        citizenHelp: '',
        assignedMuktarId: undefined,
        assignedAdminId: undefined,
        assignedManagerId: 'mgr1',
        pinned: true
      },
      {
        id: '7',
        trackingNumber: 'TRK-4444',
        title: 'Street Repair',
        category: 'Roads',
        status: ComplaintStatus.PENDING,
        importance: Importance.MEDIUM,
        district: 'District 2',
        location: 'Main Boulevard',
        createdAt: '2023-10-08',
        description: 'Multiple potholes causing traffic issues',
        phoneNumber: '0978901234',
        attachments: ['https://picsum.photos/200/200'],
        citizenHelp: '',
        assignedMuktarId: undefined,
        assignedAdminId: 'a1',
        assignedManagerId: undefined,
        pinned: false
      }
    ] as Complaint[];

    let filtered = base;

    // Filter by importance based on role - Main table shows specific importance level
    if (role === Role.MUKTAR) {
      // Mukhtar only sees LOW importance complaints assigned to them
      filtered = filtered.filter(c => 
        c.importance === Importance.LOW && 
        c.assignedMuktarId && 
        (district ? c.district === district : true)
      );
    } else if (role === Role.ADMIN) {
      // Admin sees all complaints but main table shows MEDIUM importance
      // They can access Mukhtar dashboard too
      // All medium importance complaints, plus ability to see all
      filtered = filtered.filter(c => c.importance === Importance.MEDIUM);
    } else if (role === Role.MANAGER) {
      // Manager sees all complaints but main table shows HIGH importance
      // They can access both Admin and Mukhtar dashboards
      filtered = filtered.filter(c => c.importance === Importance.HIGH);
    }

    return filtered;
  },

  async updateComplaintStatus(id: string, status: ComplaintStatus, notes?: string): Promise<boolean> {
    await delay(500);
    console.log(`Updated ${id} to ${status} with notes: ${notes}`);
    
    // Trigger real-time update
    window.dispatchEvent(new CustomEvent('complaintUpdated', { 
      detail: { id, updates: { status, notes } } 
    }));
    
    return true;
  },

  async updateComplaintImportance(id: string, importance: Importance): Promise<boolean> {
    await delay(500);
    console.log(`Updated ${id} importance to ${importance}`);
    
    // Trigger real-time update
    window.dispatchEvent(new CustomEvent('complaintUpdated', { 
      detail: { id, updates: { importance } } 
    }));
    
    return true;
  },

  async updateComplaintPinned(id: string, pinned: boolean): Promise<boolean> {
    await delay(500);
    console.log(`Updated ${id} pinned to ${pinned}`);
    
    // Trigger real-time update
    window.dispatchEvent(new CustomEvent('complaintUpdated', { 
      detail: { id, updates: { pinned } } 
    }));
    
    return true;
  },

  async deleteComplaint(id: string): Promise<boolean> {
    await delay(500);
    console.log(`Deleted complaint ${id}`);
    
    // Trigger real-time update
    window.dispatchEvent(new CustomEvent('complaintDeleted', { 
      detail: id 
    }));
    
    return true;
  },

  async getMuktars(): Promise<User[]> {
    await delay(400);
    return [
      { id: 'm1', name: 'Ahmed Al-Muktar', email: 'ahmed@5th.sy', role: Role.MUKTAR, district: 'District 1', joinedAt: '2023-01-01' },
      { id: 'm2', name: 'Sami Al-Muktar', email: 'sami@5th.sy', role: Role.MUKTAR, district: 'District 2', joinedAt: '2023-02-15' },
      { id: 'm3', name: 'Khaled Al-Muktar', email: 'khaled@5th.sy', role: Role.MUKTAR, district: 'District 3', joinedAt: '2023-03-10' },
    ];
  },

  async getAdmins(): Promise<User[]> {
    await delay(400);
    return [
      { id: 'a1', name: 'Fatima Al-Admin', email: 'fatima@5th.sy', role: Role.ADMIN, joinedAt: '2023-01-01' },
      { id: 'a2', name: 'Omar Al-Admin', email: 'omar@5th.sy', role: Role.ADMIN, joinedAt: '2023-02-15' },
    ];
  },

  async getManagers(): Promise<User[]> {
    await delay(400);
    return [
      { id: 'mgr1', name: 'Layla Al-Manager', email: 'layla@5th.sy', role: Role.MANAGER, joinedAt: '2023-01-01' },
    ];
  },

  async getMuktarById(id: string): Promise<User | null> {
      const muktars = await this.getMuktars();
      return muktars.find(m => m.id === id) || null;
  },

  async getMuktarStats(id: string): Promise<MuktarStats> {
      await delay(600);
      return {
          total: 150,
          resolved: 120,
          pending: 30,
          avgResolutionTime: '2 Days',
          performance: 80,
          complaintsByMonth: [
              { name: 'Jan', count: 20 },
              { name: 'Feb', count: 35 },
              { name: 'Mar', count: 25 },
              { name: 'Apr', count: 40 },
          ]
      };
  },

  async getAnnouncements(): Promise<Announcement[]> {
    await delay(300);
    return [...announcements];
  },

  async saveAnnouncement(announcement: Announcement): Promise<void> {
      await delay(400);
      if (announcements.find(a => a.id === announcement.id)) {
          announcements = announcements.map(a => a.id === announcement.id ? announcement : a);
      } else {
          announcements = [announcement, ...announcements];
      }
  },

  async deleteAnnouncement(id: string): Promise<void> {
      await delay(300);
      announcements = announcements.filter(a => a.id !== id);
  },

  async getAchievements(): Promise<Achievement[]> {
      await delay(300);
      return [...achievements];
  },

  async saveAchievement(achievement: Achievement): Promise<void> {
      await delay(400);
      if (achievements.find(a => a.id === achievement.id)) {
        achievements = achievements.map(a => a.id === achievement.id ? achievement : a);
      } else {
        achievements = [achievement, ...achievements];
      }
  },

  async deleteAchievement(id: string): Promise<void> {
      await delay(300);
      achievements = achievements.filter(a => a.id !== id);
  },

  async submitComplaint(data: any): Promise<string> {
    await delay(1500);
    // Simulate n8n trigger
    console.log("Calling n8n webhook...", data);
    return `TRK-${Math.floor(Math.random() * 100000)}`;
  },

  async createUser(userData: { name: string; email: string; password: string; role: Role; district?: string }): Promise<User> {
    await delay(800);
    const newUser: User = {
      id: Math.random().toString(36).substring(7),
      name: userData.name,
      email: userData.email,
      role: userData.role,
      district: userData.district,
      joinedAt: new Date().toISOString().split('T')[0]
    };
    console.log("Created user:", newUser, "with password:", userData.password);
    return newUser;
  }
};
