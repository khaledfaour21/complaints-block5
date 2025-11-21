
import { Complaint, ComplaintStatus, User, Role, Announcement, Achievement, MuktarStats } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// MOCK DATA STORE (In-memory for demo)
let achievements: Achievement[] = [
    { id: '1', title: 'Park Renovation', description: 'Renovated the central park.', date: '2023-10-15', images: ['https://picsum.photos/400/250?random=1'] }
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
        urgency: 'Urgent',
        title: 'Broken transformer on Main St',
        description: 'The main transformer has been sparking for 2 days. Please fix immediately.',
        status: ComplaintStatus.IN_PROGRESS,
        createdAt: '2023-10-25',
        expectedCompletion: '2023-10-28',
        phoneNumber: '0912345678',
        attachments: ['https://picsum.photos/200/200'],
        muktarNotes: 'Maintenance team dispatched.'
      } as any;
    }
    return null;
  },

  async getComplaints(role: Role, district?: string): Promise<Complaint[]> {
    await delay(500);
    const base = [
      { id: '1', trackingNumber: 'TRK-1234', title: 'Broken Light', category: 'Electricity', status: ComplaintStatus.UNREAD, urgency: 'Normal', district: 'District 1', createdAt: '2023-10-01' },
      { id: '2', trackingNumber: 'TRK-5678', title: 'Water Leak', category: 'Water', status: ComplaintStatus.IN_PROGRESS, urgency: 'Critical', district: 'District 2', createdAt: '2023-10-02' },
      { id: '3', trackingNumber: 'TRK-9999', title: 'Pothole', category: 'Roads', status: ComplaintStatus.COMPLETED, urgency: 'Urgent', district: 'District 1', createdAt: '2023-09-25' },
      { id: '4', trackingNumber: 'TRK-1111', title: 'Garbage', category: 'Sanitation', status: ComplaintStatus.UNREAD, urgency: 'Normal', district: 'District 3', createdAt: '2023-10-05' },
      { id: '5', trackingNumber: 'TRK-2222', title: 'Noise', category: 'General', status: ComplaintStatus.REJECTED, urgency: 'Normal', district: 'District 1', createdAt: '2023-10-06' },
    ] as any[];

    if (district) {
        return base.filter(c => c.district === district);
    }
    return base;
  },

  async updateComplaintStatus(id: string, status: ComplaintStatus, notes?: string): Promise<boolean> {
    await delay(500);
    console.log(`Updated ${id} to ${status} with notes: ${notes}`);
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
  }
};
