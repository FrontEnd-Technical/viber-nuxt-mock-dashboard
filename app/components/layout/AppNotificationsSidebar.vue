<script setup lang="ts">
interface NotificationItem {
  icon: string
  tone: 'lavender' | 'blue' | 'mint'
  message: string
  time: string
}

interface ActivityItem {
  initials: string
  tone: string
  message: string
  time: string
}

interface ContactItem {
  initials: string
  tone: string
  name: string
}

defineEmits<{
  close: []
}>()

const notifications: NotificationItem[] = [
  { icon: 'mdi-calendar-check-outline', tone: 'lavender', message: 'Có đặt phòng mới.', time: 'Vừa xong' },
  { icon: 'mdi-account-plus-outline', tone: 'blue', message: 'Khách hàng mới đã đăng ký.', time: '59 phút trước' },
  { icon: 'mdi-bed-outline', tone: 'lavender', message: 'Trạng thái phòng đã được cập nhật.', time: '12 giờ trước' },
  { icon: 'mdi-message-text-outline', tone: 'mint', message: 'Bạn có tin nhắn mới từ khách lưu trú.', time: 'Hôm nay, 11:59' },
]

const activities: ActivityItem[] = [
  { initials: 'LN', tone: 'lavender', message: 'Đã cập nhật thông tin đặt phòng.', time: 'Vừa xong' },
  { initials: 'MT', tone: 'mint', message: 'Đã hoàn tất nhận phòng.', time: '59 phút trước' },
  { initials: 'AT', tone: 'blue', message: 'Đã gửi yêu cầu bảo trì.', time: '12 giờ trước' },
  { initials: 'HN', tone: 'peach', message: 'Đã cập nhật hồ sơ khách hàng.', time: 'Hôm nay, 11:59' },
  { initials: 'QD', tone: 'lavender', message: 'Đã trả phòng.', time: 'Hôm qua' },
]

const contacts: ContactItem[] = [
  { initials: 'LN', tone: 'lavender', name: 'Lan Nguyễn' },
  { initials: 'MT', tone: 'mint', name: 'Minh Trần' },
  { initials: 'AT', tone: 'blue', name: 'An Trần' },
  { initials: 'HN', tone: 'peach', name: 'Hà Nguyễn' },
  { initials: 'QD', tone: 'lavender', name: 'Quân Đỗ' },
  { initials: 'MA', tone: 'mint', name: 'Mai Anh' },
]
</script>

<template>
  <aside class="notifications-panel">
    <header class="notifications-panel__header">
      <h2>Thông báo</h2>
      <v-btn
        icon="mdi-close"
        variant="text"
        density="compact"
        size="small"
        aria-label="Đóng bảng thông báo"
        @click="$emit('close')"
      />
    </header>

    <section class="notifications-panel__section" aria-labelledby="notifications-title">
      <h3 id="notifications-title" class="notifications-panel__section-title">
        Thông báo mới
      </h3>
      <ul class="notifications-list">
        <li
          v-for="(notification, index) in notifications"
          :key="`${notification.time}-${index}`"
          class="notification-item"
        >
          <span
            class="notification-item__icon"
            :class="`tone-${notification.tone}`"
            aria-hidden="true"
          >
            <v-icon :icon="notification.icon" size="16" />
          </span>
          <div class="notification-item__copy">
            <p>{{ notification.message }}</p>
            <time>{{ notification.time }}</time>
          </div>
        </li>
      </ul>
    </section>

    <section class="notifications-panel__section" aria-labelledby="activities-title">
      <h3 id="activities-title" class="notifications-panel__section-title">
        Hoạt động
      </h3>
      <ul class="activities-list">
        <li
          v-for="(activity, index) in activities"
          :key="`${activity.initials}-${index}`"
          class="activity-item"
        >
          <v-avatar
            size="24"
            class="activity-item__avatar"
            :class="`tone-${activity.tone}`"
            aria-hidden="true"
          >
            <span>{{ activity.initials }}</span>
          </v-avatar>
          <div class="notification-item__copy">
            <p>{{ activity.message }}</p>
            <time>{{ activity.time }}</time>
          </div>
        </li>
      </ul>
    </section>

    <section class="notifications-panel__section notifications-panel__section--contacts" aria-labelledby="contacts-title">
      <h3 id="contacts-title" class="notifications-panel__section-title">
        Liên hệ
      </h3>
      <ul class="contacts-list">
        <li v-for="contact in contacts" :key="contact.initials" class="contact-item">
          <v-avatar
            size="24"
            :class="`tone-${contact.tone}`"
            aria-hidden="true"
          >
            <span>{{ contact.initials }}</span>
          </v-avatar>
          <span>{{ contact.name }}</span>
        </li>
      </ul>
    </section>
  </aside>
</template>

<style scoped>
.notifications-panel {
  display: flex;
  width: 100%;
  min-height: 100%;
  flex-direction: column;
  gap: 20px;
  padding: 16px;
  border-radius: 20px 0 0 20px;
  background: #fff;
  color: var(--color-text);
}

.notifications-panel__header {
  display: flex;
  min-height: 24px;
  align-items: center;
  justify-content: space-between;
}

.notifications-panel__header h2,
.notifications-panel__section-title {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
}

.notifications-panel__section {
  min-width: 0;
}

.notifications-panel__section-title {
  margin-bottom: 8px;
}

.notifications-list,
.activities-list,
.contacts-list {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}

.notifications-list {
  gap: 4px;
}

.notification-item {
  display: flex;
  min-height: 52px;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 4px;
}

.notification-item__icon {
  display: grid;
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  place-items: center;
  border-radius: 7px;
}

.notification-item__copy {
  min-width: 0;
}

.notification-item__copy p {
  margin: 0;
  font-size: 13px;
  line-height: 18px;
}

.notification-item__copy time {
  display: block;
  color: #a0a0a0;
  font-size: 12px;
  line-height: 16px;
}

.activities-list {
  gap: 0;
}

.activity-item {
  position: relative;
  display: grid;
  min-height: 44px;
  grid-template-columns: 24px minmax(0, 1fr);
  gap: 8px;
  padding: 4px;
}

.activity-item:not(:last-child)::after {
  position: absolute;
  top: 28px;
  bottom: -1px;
  left: 15px;
  width: 1px;
  background: #e5e5e5;
  content: '';
}

.activity-item__avatar {
  z-index: 1;
  font-size: 9px;
  font-weight: 600;
}

.contacts-list {
  gap: 4px;
}

.contact-item {
  display: flex;
  min-height: 40px;
  align-items: center;
  gap: 8px;
  padding-inline: 4px;
  font-size: 13px;
}

.contact-item .v-avatar {
  font-size: 9px;
  font-weight: 600;
}

.tone-lavender {
  background: #edeefc;
  color: #585b83;
}

.tone-blue {
  background: #e6f1fd;
  color: #476b8d;
}

.tone-mint {
  background: #e1f6f1;
  color: #397b6c;
}

.tone-peach {
  background: #f9ebe4;
  color: #966851;
}

@media (max-width: 600px) {
  .notifications-panel {
    border-radius: 16px 0 0 16px;
  }
}
</style>
