// BACKEND INTEGRATION: GET /api/v1/admin/marketing/*


export interface MarketingOverview {
  totalRegistrations: number;
  registrationsToday: number;
  registrationsLast7Days: number;
  qualifiedCustomers: number;
  conversions: number;
  conversionRate: number;
  topSource: string;
  topAffiliate: string;
  topCampaign: string;
  topCountry: string;
}

export interface Registration {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  source: string;
  affiliate: string;
  campaign: string;
  registeredAt: string;
  status: 'pending' | 'verified' | 'active' | 'rejected' | 'suspended';
  assignedStaff: string;
}

export const marketingService = {
  async getOverview(): Promise<MarketingOverview> {
    // BACKEND INTEGRATION: GET /api/v1/admin/marketing/overview
    return {
      totalRegistrations: 14_820,
      registrationsToday: 84,
      registrationsLast7Days: 612,
      qualifiedCustomers: 8_940,
      conversions: 3_218,
      conversionRate: 21.71,
      topSource: 'Google Ads',
      topAffiliate: 'AFF-0042',
      topCampaign: 'summer-2026',
      topCountry: 'United Kingdom',
    };
  },

  async getRegistrations(): Promise<Registration[]> {
    // BACKEND INTEGRATION: GET /api/v1/admin/registrations
    return [
      { id: 'reg-001', firstName: 'Marcus', lastName: 'Whitfield', email: 'marcus.w@gmail.com', phone: '+44 7700 900142', country: 'United Kingdom', source: 'Google Ads', affiliate: 'AFF-0042', campaign: 'summer-2026', registeredAt: '2026-08-27 14:22', status: 'active', assignedStaff: 'Sarah Chen' },
      { id: 'reg-002', firstName: 'Priya', lastName: 'Sharma', email: 'priya.sharma@outlook.com', phone: '+91 98765 43210', country: 'India', source: 'Facebook', affiliate: 'AFF-0018', campaign: 'asia-q3', registeredAt: '2026-08-27 13:48', status: 'verified', assignedStaff: 'James Park' },
      { id: 'reg-003', firstName: 'Carlos', lastName: 'Mendoza', email: 'cmendoza@proton.me', phone: '+34 612 345 678', country: 'Spain', source: 'Organic', affiliate: '', campaign: '', registeredAt: '2026-08-27 12:15', status: 'pending', assignedStaff: '' },
      { id: 'reg-004', firstName: 'Aisha', lastName: 'Al-Rashidi', email: 'aisha.rashidi@email.ae', phone: '+971 50 123 4567', country: 'UAE', source: 'Affiliate', affiliate: 'AFF-0099', campaign: 'mena-launch', registeredAt: '2026-08-27 11:02', status: 'active', assignedStaff: 'Sarah Chen' },
      { id: 'reg-005', firstName: 'Dmitri', lastName: 'Volkov', email: 'd.volkov@mail.ru', phone: '+7 916 555 0123', country: 'Russia', source: 'Google Ads', affiliate: 'AFF-0042', campaign: 'summer-2026', registeredAt: '2026-08-27 10:33', status: 'rejected', assignedStaff: 'James Park' },
      { id: 'reg-006', firstName: 'Fatima', lastName: 'Okonkwo', email: 'f.okonkwo@yahoo.com', phone: '+234 802 345 6789', country: 'Nigeria', source: 'YouTube', affiliate: 'AFF-0055', campaign: 'africa-q3', registeredAt: '2026-08-27 09:14', status: 'verified', assignedStaff: '' },
      { id: 'reg-007', firstName: 'Thomas', lastName: 'Bergmann', email: 'tbergmann@web.de', phone: '+49 172 345 6789', country: 'Germany', source: 'Email', affiliate: '', campaign: 'newsletter-aug', registeredAt: '2026-08-26 22:40', status: 'active', assignedStaff: 'Sarah Chen' },
      { id: 'reg-008', firstName: 'Yuki', lastName: 'Tanaka', email: 'yuki.tanaka@docomo.ne.jp', phone: '+81 90 1234 5678', country: 'Japan', source: 'Twitter/X', affiliate: 'AFF-0077', campaign: 'apac-q3', registeredAt: '2026-08-26 19:22', status: 'pending', assignedStaff: '' },
      { id: 'reg-009', firstName: 'Elena', lastName: 'Popescu', email: 'elena.p@gmail.com', phone: '+40 721 234 567', country: 'Romania', source: 'Google Ads', affiliate: 'AFF-0042', campaign: 'summer-2026', registeredAt: '2026-08-26 17:05', status: 'active', assignedStaff: 'James Park' },
      { id: 'reg-010', firstName: 'Ahmed', lastName: 'Hassan', email: 'ahmed.hassan@hotmail.com', phone: '+20 100 234 5678', country: 'Egypt', source: 'Affiliate', affiliate: 'AFF-0099', campaign: 'mena-launch', registeredAt: '2026-08-26 14:30', status: 'verified', assignedStaff: 'Sarah Chen' },
    ];
  },

  async getRegistrationTimeline(): Promise<{ date: string; count: number }[]> {
    // BACKEND INTEGRATION: GET /api/v1/admin/marketing/timeline
    return [
      { date: 'Aug 20', count: 72 },
      { date: 'Aug 21', count: 68 },
      { date: 'Aug 22', count: 91 },
      { date: 'Aug 23', count: 84 },
      { date: 'Aug 24', count: 110 },
      { date: 'Aug 25', count: 95 },
      { date: 'Aug 26', count: 108 },
      { date: 'Aug 27', count: 84 },
    ];
  },

  async getSourcePerformance(): Promise<{ source: string; count: number; conversion: number }[]> {
    // BACKEND INTEGRATION: GET /api/v1/admin/marketing/sources
    return [
      { source: 'Google Ads', count: 4820, conversion: 28.4 },
      { source: 'Facebook', count: 2940, conversion: 18.2 },
      { source: 'Affiliate', count: 3210, conversion: 24.8 },
      { source: 'Organic', count: 1840, conversion: 31.2 },
      { source: 'YouTube', count: 980, conversion: 15.6 },
      { source: 'Email', count: 620, conversion: 42.1 },
      { source: 'Twitter/X', count: 410, conversion: 12.8 },
    ];
  },
};