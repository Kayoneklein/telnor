-dontwarn dalvik.system.VMStack
-dontwarn java.lang.ProcessHandle
-dontwarn java.lang.management.ManagementFactory
-dontwarn java.lang.management.RuntimeMXBean
-dontwarn javax.naming.InitialContext
-dontwarn javax.naming.NameNotFoundException
-dontwarn javax.naming.NamingException
-dontwarn sun.reflect.Reflection

# Ignore kotlin-logging logback references
-dontwarn ch.qos.logback.classic.**
-dontwarn io.github.oshai.kotlinlogging.logback.**