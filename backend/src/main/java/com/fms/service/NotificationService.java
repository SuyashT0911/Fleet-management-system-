package com.fms.service;

import com.fms.model.Notification;
import com.fms.model.User;
import com.fms.repository.NotificationRepository;
import com.fms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    public void create(String title, String message, String type, String entityType, Integer entityId, String details) {
        Notification n = new Notification(title, message, type, entityType, entityId);
        n.setDetails(details);
        notificationRepository.save(n);
    }

    public void create(String title, String message, String type, String entityType, Integer entityId) {
        create(title, message, type, entityType, entityId, null);
    }

    public void createForUser(User user, String title, String message, String type, String entityType, Integer entityId) {
        Notification n = new Notification(title, message, type, entityType, entityId);
        n.setUser(user);
        notificationRepository.save(n);
    }

    public void createForRole(String roleName, String title, String message, String type, String entityType, Integer entityId) {
        List<User> users = userRepository.findByRoleRoleName(roleName);
        for (User user : users) {
            createForUser(user, title, message, type, entityType, entityId);
        }
    }

    public List<Notification> getAll() {
        return notificationRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Notification> getUnread() {
        return notificationRepository.findByIsReadFalseOrderByCreatedAtDesc();
    }

    public long getUnreadCount() {
        return notificationRepository.countByIsReadFalse();
    }

    public Notification markAsRead(Integer id) {
        Notification n = notificationRepository.findById(id).orElse(null);
        if (n != null) {
            n.setIsRead(true);
            return notificationRepository.save(n);
        }
        return null;
    }

    public void markAllAsRead() {
        List<Notification> unread = notificationRepository.findByIsReadFalseOrderByCreatedAtDesc();
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }

    public Notification getById(Integer id) {
        return notificationRepository.findById(id).orElse(null);
    }

    public List<Notification> getByUser(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public List<Notification> getByUserWithGlobal(User user) {
        return notificationRepository.findByUserOrUserIsNullOrderByCreatedAtDesc(user);
    }
}
