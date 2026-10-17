import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  ArrowLeft, ArrowRightLeft, ArrowUpDown, Ban, Calendar, CalendarDays, Check, ChevronDown,
  ChevronRight, CircleAlert, CircleCheck, Clock, Cloud, CloudDrizzle, CloudFog, CloudLightning,
  CloudRain, CloudSnow, CloudSun, Coins, Compass, Droplets, EllipsisVertical, Eye, EyeOff, Funnel,
  Globe, History, Hourglass, House, IconNode, Info, LayoutDashboard, Lock, LogOut, Luggage, Mail,
  MapPin, Menu, Palette, Pencil, Plane, PlaneTakeoff, Plus, Search, Shield, ShieldX, Star, Sun,
  Thermometer, Trash2, TrendingDown, TrendingUp, TriangleAlert, User, UserPlus, Users, Wallet,
  Wind, X,
} from 'lucide';

const ICONS = {
  'arrow-left': ArrowLeft,
  'arrow-right-left': ArrowRightLeft,
  'arrow-up-down': ArrowUpDown,
  ban: Ban,
  calendar: Calendar,
  'calendar-days': CalendarDays,
  check: Check,
  'chevron-down': ChevronDown,
  'chevron-right': ChevronRight,
  'circle-alert': CircleAlert,
  'circle-check': CircleCheck,
  clock: Clock,
  cloud: Cloud,
  'cloud-drizzle': CloudDrizzle,
  'cloud-fog': CloudFog,
  'cloud-lightning': CloudLightning,
  'cloud-rain': CloudRain,
  'cloud-snow': CloudSnow,
  'cloud-sun': CloudSun,
  coins: Coins,
  compass: Compass,
  droplets: Droplets,
  ellipsis: EllipsisVertical,
  eye: Eye,
  'eye-off': EyeOff,
  funnel: Funnel,
  globe: Globe,
  history: History,
  hourglass: Hourglass,
  house: House,
  info: Info,
  dashboard: LayoutDashboard,
  lock: Lock,
  logout: LogOut,
  luggage: Luggage,
  mail: Mail,
  'map-pin': MapPin,
  menu: Menu,
  palette: Palette,
  pencil: Pencil,
  plane: Plane,
  'plane-takeoff': PlaneTakeoff,
  plus: Plus,
  search: Search,
  shield: Shield,
  'shield-x': ShieldX,
  star: Star,
  sun: Sun,
  thermometer: Thermometer,
  trash: Trash2,
  'trending-down': TrendingDown,
  'trending-up': TrendingUp,
  alert: TriangleAlert,
  user: User,
  'user-plus': UserPlus,
  users: Users,
  wallet: Wallet,
  wind: Wind,
  x: X,
} satisfies Record<string, IconNode>;

export type IconName = keyof typeof ICONS;

/** Ícones da biblioteca Lucide renderizados como SVG inline. */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex shrink-0', 'aria-hidden': 'true' },
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      [attr.width]="size()"
      [attr.height]="size()"
      [attr.stroke-width]="stroke()"
      [attr.fill]="fill()"
    >
      @for (node of nodes(); track $index) {
        @switch (node[0]) {
          @case ('path') {
            <svg:path [attr.d]="node[1]['d']" />
          }
          @case ('circle') {
            <svg:circle [attr.cx]="node[1]['cx']" [attr.cy]="node[1]['cy']" [attr.r]="node[1]['r']" />
          }
          @case ('rect') {
            <svg:rect
              [attr.x]="node[1]['x']"
              [attr.y]="node[1]['y']"
              [attr.width]="node[1]['width']"
              [attr.height]="node[1]['height']"
              [attr.rx]="node[1]['rx'] ?? null"
              [attr.ry]="node[1]['ry'] ?? null"
            />
          }
          @case ('line') {
            <svg:line
              [attr.x1]="node[1]['x1']"
              [attr.y1]="node[1]['y1']"
              [attr.x2]="node[1]['x2']"
              [attr.y2]="node[1]['y2']"
            />
          }
        }
      }
    </svg>
  `,
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(20);
  readonly stroke = input(2);
  readonly fill = input('none');

  protected readonly nodes = computed(
    () => ICONS[this.name()] as unknown as [string, Record<string, string | undefined>][],
  );
}
