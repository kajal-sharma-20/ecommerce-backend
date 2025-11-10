-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 10, 2025 at 06:06 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ecommerce`
--

-- --------------------------------------------------------

--
-- Table structure for table `cart`
--

CREATE TABLE `cart` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) DEFAULT 0.00,
  `delivery_fee` decimal(10,2) DEFAULT 0.00,
  `payable_amount` decimal(10,2) DEFAULT 0.00,
  `payment_method` varchar(50) NOT NULL,
  `status` varchar(50) DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `name` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `shipping_address` text DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `delivery_status` enum('Order Placed','Processing','Packed','Out for Delivery','Delivered','Cancelled') DEFAULT 'Order Placed',
  `cancel_request_status` enum('None','Pending','Approved','Rejected') DEFAULT 'None',
  `payment_intent_id` varchar(255) DEFAULT NULL,
  `refund_id` varchar(255) DEFAULT NULL,
  `refund_status` varchar(50) DEFAULT NULL,
  `refund_date` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `total_amount`, `discount`, `delivery_fee`, `payable_amount`, `payment_method`, `status`, `created_at`, `name`, `phone`, `shipping_address`, `email`, `delivery_status`, `cancel_request_status`, `payment_intent_id`, `refund_id`, `refund_status`, `refund_date`) VALUES
(98, 25, 2000.00, 200.00, 50.00, 1850.00, 'COD', 'pending', '2025-11-03 10:44:31', 'kajal', '984280053', 'moga', 'kajal0120sharma@gmail.com', 'Order Placed', 'Rejected', NULL, NULL, NULL, NULL),
(99, 26, 2000.00, 200.00, 0.00, 1800.00, 'CARD', 'Refunded', '2025-11-03 10:45:02', 'kajal', '984280053', 'moga', 'kajal0120sharma@gmail.com', 'Cancelled', 'Approved', 'pi_3SPLGAQMGyNhbRxZ1vYeR4dR', 're_3SPLGAQMGyNhbRxZ1Lix8wX2', 'Success', '2025-11-04 09:43:49'),
(100, 25, 500.00, 50.00, 50.00, 500.00, 'COD', 'pending', '2025-11-03 10:45:47', 'kajal', '9876543212', 'moga', 'kajalsharma.dx@gmail.com', 'Order Placed', 'Pending', NULL, NULL, NULL, NULL),
(101, 26, 1500.00, 150.00, 0.00, 1350.00, 'CARD', 'Refunded', '2025-11-03 10:46:37', 'ritu', '9876543212', 'moga', 'kajal0120sharma@gmail.com', 'Cancelled', 'Rejected', 'pi_3SPLHcQMGyNhbRxZ1Ae8GWeD', 'ch_3SPLHcQMGyNhbRxZ16Nm4ZDT', 'succeeded', '2025-11-03 16:28:36'),
(102, 25, 2300.00, 230.00, 50.00, 2120.00, 'COD', 'cancelled', '2025-11-03 10:47:59', 'ritu', '984280053', 'moga', 'kajal0120sharma@gmail.com', 'Cancelled', 'None', NULL, NULL, NULL, NULL),
(103, 25, 2000.00, 200.00, 50.00, 1850.00, 'COD', 'cancelled', '2025-11-03 10:48:25', 'kajal', '984280053', 'moga', 'kajal0120sharma@gmail.com', 'Cancelled', 'Pending', NULL, NULL, NULL, NULL),
(104, 26, 4300.00, 430.00, 0.00, 3870.00, 'CARD', 'Refunded', '2025-11-03 10:49:05', 'kajal', '9876543212', 'moga', 'kajal0120sharma@gmail.com', 'Cancelled', 'Approved', 'pi_3SPLK0QMGyNhbRxZ0YJfqIIm', 'ch_3SPLK0QMGyNhbRxZ0HXQyQ4z', 'succeeded', '2025-11-03 16:23:00'),
(112, 26, 2500.00, 250.00, 0.00, 2250.00, 'CARD', 'Refunded', '2025-11-04 04:32:51', 'kajal sharma', '09842800053', 'moga,bagha purana', 'kajal123@gmail.com', 'Cancelled', 'Approved', 'pi_3SPbvUQMGyNhbRxZ1oiTTtKa', 'ch_3SPbvUQMGyNhbRxZ1XjXHlRZ', 'succeeded', '2025-11-04 10:03:30'),
(113, 26, 500.00, 50.00, 0.00, 450.00, 'CARD', 'Refunded', '2025-11-04 04:38:33', 'kajal sharma', '09842800053', 'moga,bagha purana', 'kajalsharma.dx@gmail.com', 'Cancelled', 'Approved', 'pi_3SPc0xQMGyNhbRxZ1jgc0Xhz', 'ch_3SPc0xQMGyNhbRxZ1g0NqUcO', 'succeeded', '2025-11-04 10:09:13'),
(114, 26, 2000.00, 200.00, 0.00, 1800.00, 'CARD', 'Refunded', '2025-11-04 04:42:43', 'kajal sharma', '09842800053', 'moga,bagha purana', 'kajal0120sharma@gmail.com', 'Cancelled', 'Approved', 'pi_3SPc55QMGyNhbRxZ147eNxbh', 'ch_3SPc55QMGyNhbRxZ1SSFGc15', 'succeeded', '2025-11-04 10:13:41'),
(115, 25, 1500.00, 155.00, 50.00, 1395.00, 'CARD', 'paid', '2025-11-04 08:55:02', 'kajal sharma', '09842800053', 'moga,bagha purana', 'kajal0120sharma@gmail.com', 'Order Placed', 'None', 'pi_3SPg1IQMGyNhbRxZ1dphYcRX', NULL, NULL, NULL),
(116, 25, 6000.00, 605.00, 50.00, 5445.00, 'CARD', 'paid', '2025-11-04 11:21:27', 'kajal sharma', '09842800053', 'moga,bagha purana', 'kaja0120sharma@gmail.com', 'Order Placed', 'None', 'pi_3SPiJMQMGyNhbRxZ0ybeFKrn', NULL, NULL, NULL),
(117, 25, 1500.00, 150.00, 50.00, 1400.00, 'COD', 'pending', '2025-11-06 05:20:31', 'kajal sharma', '09842800053', 'moga,bagha purana', 'kajal0120sharma@gmail.com', 'Order Placed', 'None', NULL, NULL, NULL, NULL),
(120, 33, 4000.00, 0.00, 50.00, 4050.00, 'CARD', 'Refunded', '2025-11-07 05:20:59', 'kajal sharma', '09842800053', 'moga,bagha purana', 'kajal0120sharma@gmail.com', 'Cancelled', 'Approved', 'pi_3SQi6iQMGyNhbRxZ1yZg3WOE', 'ch_3SQi6iQMGyNhbRxZ1go7MsRH', 'succeeded', '2025-11-07 10:51:46'),
(121, 33, 500.00, 0.00, 50.00, 550.00, 'COD', 'pending', '2025-11-07 05:44:11', 'kajal sharma', '09842800053', 'moga,bagha purana', 'kajal0120sharma@gmail.com', 'Order Placed', 'Pending', NULL, NULL, NULL, NULL),
(122, 33, 500.00, 0.00, 50.00, 550.00, 'COD', 'cancelled', '2025-11-07 05:49:27', 'kajal sharma', '09842800053', 'moga,bagha purana', 'kajal0120sharma@gmail.com', 'Cancelled', 'Approved', NULL, NULL, NULL, NULL),
(123, 33, 2500.00, 0.00, 50.00, 2550.00, 'CARD', 'Refunded', '2025-11-07 05:56:56', 'kajal sharma', '09842800053', 'moga,bagha purana', 'kajal0120sharma@gmail.com', 'Cancelled', 'Approved', 'pi_3SQifTQMGyNhbRxZ1YaPGqit', 'ch_3SQifTQMGyNhbRxZ1ZjjVHto', 'succeeded', '2025-11-07 11:28:58'),
(124, 33, 2500.00, 0.00, 50.00, 2550.00, 'COD', 'pending', '2025-11-07 06:00:31', 'kajal sharma', '09842800053', 'moga,bagha purana', 'kajal0120sharma@gmail.com', 'Order Placed', 'None', NULL, NULL, NULL, NULL),
(125, 33, 1500.00, 155.00, 50.00, 1395.00, 'CARD', 'paid', '2025-11-07 06:43:18', 'kajal sharma', '09842800053', 'moga,bagha purana', 'kajal0120sharma@gmail.com', 'Order Placed', 'None', 'pi_3SQjPMQMGyNhbRxZ1aTWq6kD', NULL, NULL, NULL),
(126, 33, 2000.00, 205.00, 50.00, 1845.00, 'CARD', 'paid', '2025-11-07 06:49:34', 'kajal sharma', '09842800053', 'moga,bagha purana', 'kajal0120sharma@gmail.com', 'Order Placed', 'None', 'pi_3SQjUQQMGyNhbRxZ0wKjNvFG', NULL, NULL, NULL),
(127, 33, 1500.00, 155.00, 50.00, 1395.00, 'CARD', 'paid', '2025-11-07 06:55:18', 'kajal sharma', '09842800053', 'moga,bagha purana', 'kajal0120sharma@gmail.com', 'Order Placed', 'None', 'pi_3SQjZyQMGyNhbRxZ1IqKxxfF', NULL, NULL, NULL),
(128, 33, 4000.00, 405.00, 50.00, 3645.00, 'CARD', 'paid', '2025-11-07 06:58:46', 'kajal sharma', '09842800053', 'moga,bagha purana', 'kajal0120sharma@gmail.com', 'Order Placed', 'None', 'pi_3SQjdJQMGyNhbRxZ04X7z6tN', NULL, NULL, NULL),
(129, 33, 2000.00, 205.00, 50.00, 1845.00, 'CARD', 'paid', '2025-11-07 07:12:24', 'kajal sharma', '09842800053', 'moga,bagha purana', 'kajal0120sharma@gmail.com', 'Order Placed', 'None', 'pi_3SQjqVQMGyNhbRxZ1ehPmpLe', NULL, NULL, NULL),
(130, 33, 1500.00, 155.00, 50.00, 1395.00, 'CARD', 'paid', '2025-11-07 07:13:11', 'kajal sharma', '09842800053', 'moga,bagha purana', 'kajal0120sharma@gmail.com', 'Order Placed', 'None', 'pi_3SQjrFQMGyNhbRxZ1lNbg2Qu', NULL, NULL, NULL),
(131, 33, 2000.00, 205.00, 50.00, 1845.00, 'CARD', 'paid', '2025-11-07 07:14:33', 'kajal sharma', '09842800053', 'moga,bagha purana', 'kajal0120sharma@gmail.com', 'Order Placed', 'None', 'pi_3SQjsaQMGyNhbRxZ0Y2Jkl4B', NULL, NULL, NULL),
(132, 33, 2000.00, 205.00, 50.00, 1845.00, 'CARD', 'paid', '2025-11-07 11:42:36', 'kajal sharma', '09842800053', 'moga,bagha purana', 'kajal0120sharma@gmail.com', 'Order Placed', 'None', 'pi_3SQo53QMGyNhbRxZ1cIcJ0E8', NULL, NULL, NULL),
(133, 33, 500.00, 55.00, 50.00, 495.00, 'CARD', 'paid', '2025-11-07 11:47:52', 'kajal sharma', '09842800053', 'moga,bagha purana', 'kajal0120sharma@gmail.com', 'Order Placed', 'None', 'pi_3SQo9AQMGyNhbRxZ1LuT8XKO', NULL, NULL, NULL),
(134, 33, 500.00, 55.00, 50.00, 495.00, 'CARD', 'paid', '2025-11-07 11:52:14', 'kajal sharma', '09842800053', 'moga,bagha purana', 'kajal0120sharma@gmail.com', 'Delivered', 'None', 'pi_3SQoDXQMGyNhbRxZ0cMLXh3N', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price`) VALUES
(119, 99, 22, 1, 1500.00),
(120, 99, 23, 1, 500.00),
(121, 100, 23, 1, 500.00),
(122, 101, 22, 1, 1500.00),
(123, 102, 41, 1, 2300.00),
(124, 103, 25, 1, 2000.00),
(125, 104, 41, 1, 2300.00),
(126, 104, 25, 1, 2000.00),
(137, 113, 23, 1, 500.00),
(138, 114, 24, 1, 2000.00),
(139, 115, 22, 1, 1500.00),
(140, 116, 23, 12, 500.00),
(141, 117, 22, 1, 1500.00),
(148, 120, 22, 1, 1500.00),
(149, 120, 23, 1, 500.00),
(150, 120, 24, 1, 2000.00),
(151, 121, 23, 1, 500.00),
(152, 122, 23, 1, 500.00),
(153, 123, 23, 1, 500.00),
(154, 123, 25, 1, 2000.00),
(155, 124, 23, 1, 500.00),
(156, 124, 24, 1, 2000.00),
(157, 125, 22, 1, 1500.00),
(158, 126, 22, 1, 1500.00),
(159, 126, 23, 1, 500.00),
(160, 127, 22, 1, 1500.00),
(161, 128, 22, 1, 1500.00),
(162, 128, 23, 1, 500.00),
(163, 128, 24, 1, 2000.00),
(164, 129, 22, 1, 1500.00),
(165, 129, 23, 1, 500.00),
(166, 130, 22, 1, 1500.00),
(167, 131, 22, 1, 1500.00),
(168, 131, 23, 1, 500.00),
(169, 132, 22, 1, 1500.00),
(170, 132, 23, 1, 500.00),
(171, 133, 23, 1, 500.00),
(172, 134, 23, 1, 500.00);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `main_image` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `price` decimal(10,2) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `stripe_product_id` varchar(255) DEFAULT NULL,
  `stripe_price_id` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `main_image`, `image`, `stock`, `price`, `description`, `category`, `created_at`, `updated_at`, `stripe_product_id`, `stripe_price_id`) VALUES
(22, 'puma shoes', 'https://res.cloudinary.com/dkc4pd8ht/image/upload/v1761652969/blog/ywa3rjb3f4blinbn9mx4.jpg', '[\"https://res.cloudinary.com/dkc4pd8ht/image/upload/v1761115438/blog/fst3ljriirtqgnwshjm8.jpg\",\"https://res.cloudinary.com/dkc4pd8ht/image/upload/v1761115437/blog/x9kipfe8diqmdyulzfee.jpg\"]', 284, 1500.00, 'flexibility', 'shoes', '2025-10-22 06:44:00', '2025-11-07 11:42:36', 'prod_THUlvk37hx1xPJ', 'price_1SKvm9QMGyNhbRxZsqb5yomp'),
(23, 'cough', 'https://res.cloudinary.com/dkc4pd8ht/image/upload/v1761115963/blog/ynceohfo7c2cnchejffc.jpg', '[\"https://res.cloudinary.com/dkc4pd8ht/image/upload/v1761653206/blog/iphvgpvnoamapxwr489x.jpg\",\"https://res.cloudinary.com/dkc4pd8ht/image/upload/v1761653207/blog/ic0yv9ihswoyrsrdfvwk.jpg\"]', 6, 500.00, 'for cough', 'medicines', '2025-10-22 06:52:45', '2025-11-07 11:52:14', 'prod_THUuBOGI5iCpMB', 'price_1SKvudQMGyNhbRxZjjgdLNL2'),
(24, 'blue frame', 'https://res.cloudinary.com/dkc4pd8ht/image/upload/v1761116038/blog/fodfzmjhxoze6mzthx1p.jpg', '[\"https://res.cloudinary.com/dkc4pd8ht/image/upload/v1761116036/blog/sguuh1h618jsmm3pe9nh.jpg\",\"https://res.cloudinary.com/dkc4pd8ht/image/upload/v1761116036/blog/bolhiigjuign6ek9gkfa.jpg\"]', 42, 2000.00, 'beautiful and unbreakable frame', 'frames', '2025-10-22 06:53:59', '2025-11-07 06:58:46', 'prod_THUvLXPf5G87wR', 'price_1SKvvnQMGyNhbRxZ72CKF0Gs'),
(25, 'white frame', 'https://res.cloudinary.com/dkc4pd8ht/image/upload/v1761653732/blog/fnpxnuzfunfhdssbigxd.jpg', '[\"https://res.cloudinary.com/dkc4pd8ht/image/upload/v1761116103/blog/s5mkfevs0cuhwz44g5js.jpg\",\"https://res.cloudinary.com/dkc4pd8ht/image/upload/v1761116103/blog/iqcbv5pwy4erlvv3mhyo.jpg\"]', 34, 2000.00, 'beautiful and unbreakable frame', 'frames', '2025-10-22 06:55:04', '2025-11-07 05:56:56', 'prod_THUw16COq2OlE5', 'price_1SKvwrQMGyNhbRxZgYAllnLm'),
(41, 'Internet', 'https://res.cloudinary.com/dkc4pd8ht/image/upload/v1761716553/blog/b2cplsnqdtxxvdyp76au.jpg', '[\"https://res.cloudinary.com/dkc4pd8ht/image/upload/v1761716552/blog/f8aaybadfq3uuilgdvh8.jpg\",\"https://res.cloudinary.com/dkc4pd8ht/image/upload/v1761716550/blog/fxs1w1zmnvosexs4a4fc.jpg\"]', 48, 2300.00, '5g Internet', 'Technology', '2025-10-29 05:42:34', '2025-11-03 10:49:05', 'prod_TK6MbGwuwjx3Ek', 'price_1SNS9XQMGyNhbRxZ5ZhRk0oa');

-- --------------------------------------------------------

--
-- Table structure for table `subscription`
--

CREATE TABLE `subscription` (
  `id` int(11) NOT NULL,
  `plan_name` varchar(50) NOT NULL,
  `stripe_product_id` varchar(255) NOT NULL,
  `stripe_price_id` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `currency` varchar(10) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subscription`
--

INSERT INTO `subscription` (`id`, `plan_name`, `stripe_product_id`, `stripe_price_id`, `price`, `currency`, `created_at`) VALUES
(5, 'Premium', 'prod_THaLbPurXSOmh9', 'price_1SL1AnQMGyNhbRxZrs94G4n8', 500.00, 'inr', '2025-10-22 17:59:48'),
(6, 'Pro', 'prod_THaLtjwNugNY5P', 'price_1SL1AnQMGyNhbRxZOBvJOZdT', 1000.00, 'inr', '2025-10-22 17:59:49');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(50) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `profile` varchar(255) DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `otp` varchar(10) DEFAULT NULL,
  `otp_created_at` datetime DEFAULT NULL,
  `otp_expires_at` datetime DEFAULT NULL,
  `stripe_customer_id` varchar(255) DEFAULT NULL,
  `role` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0=user, 1=admin'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `profile`, `gender`, `otp`, `otp_created_at`, `otp_expires_at`, `stripe_customer_id`, `role`) VALUES
(26, 'Ritu', 'kajal0120sharma@gmail.com', '6790034562', 'https://res.cloudinary.com/dkc4pd8ht/image/upload/v1761728954/blog/imxrpzskhhbfthecc2fy.jpg', 'female', NULL, NULL, NULL, 'cus_THux02uxykb1op', 0),
(28, 'Cheshta Sharma', 'cheshtaranisharma123@gmail.com', '9876543213', 'https://res.cloudinary.com/dkc4pd8ht/image/upload/v1761741937/blog/jnrkj5rfobp9ysh45ovq.jpg', 'female', NULL, NULL, NULL, NULL, 1),
(31, NULL, 'alt.gq-dof9q3ja@yopmail.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0),
(32, NULL, 'alt.rl-djdfjpr@yopmail.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0),
(33, 'kajal sharma', 'kajalsharma.dx@gmail.com', '9842800053', 'https://res.cloudinary.com/dkc4pd8ht/image/upload/v1762429920/blog/sdqk1i7eo1jxzssczicf.jpg', 'female', NULL, NULL, NULL, 'cus_TNCKXprOemIevo', 0);

-- --------------------------------------------------------

--
-- Table structure for table `user_subscriptions`
--

CREATE TABLE `user_subscriptions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `stripe_subscription_id` varchar(255) NOT NULL,
  `price_id` varchar(255) NOT NULL,
  `status` varchar(50) DEFAULT 'incomplete',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `cancel_at_period_end` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_subscriptions`
--

INSERT INTO `user_subscriptions` (`id`, `user_id`, `stripe_subscription_id`, `price_id`, `status`, `created_at`, `updated_at`, `cancel_at_period_end`) VALUES
(31, 26, 'sub_1SLL9aQMGyNhbRxZVWXsPL1d', 'price_1SL1AnQMGyNhbRxZOBvJOZdT', 'active', '2025-10-23 09:48:05', '2025-10-23 09:49:56', 0),
(33, 33, 'sub_1SQijMQMGyNhbRxZBd1q5Wh1', 'price_1SL1AnQMGyNhbRxZrs94G4n8', 'active', '2025-11-07 06:00:53', '2025-11-07 06:01:05', 0);

-- --------------------------------------------------------

--
-- Table structure for table `wishlist`
--

CREATE TABLE `wishlist` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wishlist`
--

INSERT INTO `wishlist` (`id`, `user_id`, `product_id`, `created_at`) VALUES
(9, 23, 24, '2025-10-22 06:55:29'),
(12, 25, 22, '2025-10-24 06:36:59'),
(13, 26, 24, '2025-11-03 10:46:18'),
(14, 25, 23, '2025-11-06 11:23:26'),
(16, 33, 24, '2025-11-07 05:01:53'),
(18, 33, 22, '2025-11-07 07:15:38');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `subscription`
--
ALTER TABLE `subscription`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_subscriptions`
--
ALTER TABLE `user_subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `wishlist`
--
ALTER TABLE `wishlist`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_wishlist_item` (`user_id`,`product_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cart`
--
ALTER TABLE `cart`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=177;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=135;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=173;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `subscription`
--
ALTER TABLE `subscription`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `user_subscriptions`
--
ALTER TABLE `user_subscriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `wishlist`
--
ALTER TABLE `wishlist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `user_subscriptions`
--
ALTER TABLE `user_subscriptions`
  ADD CONSTRAINT `user_subscriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
