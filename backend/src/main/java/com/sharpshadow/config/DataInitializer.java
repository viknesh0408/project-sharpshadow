package com.sharpshadow.config;

import com.sharpshadow.entity.Category;
import com.sharpshadow.entity.User;
import com.sharpshadow.repository.CategoryRepository;
import com.sharpshadow.repository.UserRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public DataInitializer(CategoryRepository categoryRepository, UserRepository userRepository) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        seedCategories();
        log.info("SharpShadow data initialized successfully.");
    }

    private void seedCategories() {
        List<String[]> defaultCategories = List.of(
            new String[]{"UI Kits", "ui-kits", "🎨"},
            new String[]{"Mockups", "mockups", "📱"},
            new String[]{"Social Media", "social-media", "📸"},
            new String[]{"Flyers", "flyers", "📄"},
            new String[]{"Logos", "logos", "✏️"},
            new String[]{"Illustrations", "illustrations", "🖼️"},
            new String[]{"Business Cards", "business-cards", "💼"},
            new String[]{"Backgrounds", "backgrounds", "🌈"},
            new String[]{"Banners", "banners", "🏷️"},
            new String[]{"Fonts & Typography", "fonts-typography", "🔤"}
        );

        for (String[] cat : defaultCategories) {
            if (!categoryRepository.existsByName(cat[0])) {
                categoryRepository.save(Category.builder()
                        .name(cat[0])
                        .slug(cat[1])
                        .icon(cat[2])
                        .build());
            }
        }
    }
}
