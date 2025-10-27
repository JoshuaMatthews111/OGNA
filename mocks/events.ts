import { Event, LiveStream, Sermon } from '@/types';

export const upcomingEvents: Event[] = [
  {
    id: '1',
    title: 'Good Friday',
    description: 'We invite everyone to join us at 6:00pm to celebrate Good Friday.',
    date: '11th Sept',
    time: '06:00pm',
    location: 'Main Complex',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  },
  {
    id: '2',
    title: 'Sunday Service',
    description: 'Join us for our weekly Sunday service with Pastor Johnson.',
    date: '13th Sept',
    time: '10:00am',
    location: 'Main Sanctuary',
    imageUrl: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80',
  },
  {
    id: '3',
    title: 'Youth Night',
    description: 'Special evening for our youth with games, worship, and fellowship.',
    date: '15th Sept',
    time: '07:30pm',
    location: 'Youth Center',
    imageUrl: 'https://images.unsplash.com/photo-1523803326055-13445afc4606?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  },
];

export const liveStreams: LiveStream[] = [
  {
    id: '1',
    title: 'WORSHIP NIGHT',
    isLive: true,
    imageUrl: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80',
  },
  {
    id: '2',
    title: 'SUNDAY SERVICE',
    isLive: false,
    imageUrl: 'https://images.unsplash.com/photo-1477238134895-98438ad85c30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    startTime: 'Tomorrow, 10:00 AM',
  },
];

export const sermons: Sermon[] = [
  {
    id: '1',
    title: 'Finding Peace in Chaos',
    speaker: 'Pastor Johnson',
    date: 'Sept 5, 2023',
    audioUrl: 'https://example.com/sermon1.mp3',
    imageUrl: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    duration: '45:22',
  },
  {
    id: '2',
    title: 'The Power of Prayer',
    speaker: 'Pastor Smith',
    date: 'Aug 29, 2023',
    audioUrl: 'https://example.com/sermon2.mp3',
    imageUrl: 'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    duration: '38:15',
  },
  {
    id: '3',
    title: 'Walking in Faith',
    speaker: 'Pastor Williams',
    date: 'Aug 22, 2023',
    audioUrl: 'https://example.com/sermon3.mp3',
    imageUrl: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    duration: '42:50',
  },
];