import 'dart:async';
import 'dart:io';

import 'package:mason/mason.dart';

import 'constants.dart';
import 'vault.dart';

const kEnvironments = ['development', 'staging', 'ci', 'production'];

Future<void> run(HookContext context) async {
  final nonInteractive = isNonInteractive(context);

  if (nonInteractive) {
    final missing = kEnvironments
        .map(firebaseTokenEnvKey)
        .where((key) => readEnv(key) == null)
        .toList();
    if (missing.isNotEmpty) {
      throw Exception(
        'Missing required inputs in non-interactive mode. '
        'Set the environment variables: ${missing.join(', ')}. '
        'Optionally pass the projects with --var firebaseProject<Env>=<id>.',
      );
    }
  }

  final Map<String, Project?> selectedProjects = <String, Project?>{};
  for (final environment in kEnvironments) {
    final token = readEnv(firebaseTokenEnvKey(environment)) ??
        runFirebaseLogin(context, environment);

    final projects = await runFirebaseProjectList(context, token);
    final projectId = readVar(context, firebaseProjectVarKey(environment));
    if (projectId != null) {
      selectedProjects[environment] = findProject(
          env: environment, projectId: projectId, projects: projects);
    } else if (nonInteractive) {
      selectedProjects[environment] = null;
    } else {
      selectedProjects[environment] =
          chooseProject(context: context, env: environment, projects: projects);
    }
  }

  final Map<String, String> environments =
      selectedProjects.map((key, value) => MapEntry(key, value?.id ?? ''));

  context.vars.putIfAbsent('firebaseEnvinroments', () => environments);

  if (environments.values.any((project) => project.isEmpty)) {
    context.logger.alert(
      'Remember to modify the .firebaserc file for the unconfigured environments.',
    );
  }

  final String applicationName = context.vars[kApplicationNameKey];
  final vault = Vault(Directory.current.parent.parent);
  final vaultFirebaseTokenKey =
      '${applicationName.constantCase}_FIREBASE_TOKEN';

  selectedProjects.entries.forEach((entryProject) {
    final environment = entryProject.key;
    final token = entryProject.value?.firebaseToken ?? '';

    vault.pull(environment);
    vault.addVariable(environment, vaultFirebaseTokenKey, token);
    vault.push(environment);

    context.logger
        .info('🔐 Stored $vaultFirebaseTokenKey for .env.vault $environment');
  });

  context.logger.success('Firebase configured successfully 🚀');
}

bool isNonInteractive(HookContext context) =>
    context.vars['devmyNonInteractive'] == true || !stdin.hasTerminal;

String firebaseTokenEnvKey(String environment) =>
    'FIREBASE_TOKEN_${environment.toUpperCase()}';

String firebaseProjectVarKey(String environment) =>
    'firebaseProject${environment.pascalCase}';

String? readEnv(String key) {
  final value = Platform.environment[key]?.trim();
  return value == null || value.isEmpty ? null : value;
}

String? readVar(HookContext context, String key) {
  final value = context.vars[key]?.toString().trim();
  return value == null || value.isEmpty ? null : value;
}

Project findProject({
  required String env,
  required String projectId,
  required List<Project> projects,
}) {
  for (final project in projects) {
    if (project.id == projectId) {
      return project;
    }
  }

  final available = projects.map((project) => project.id).join(', ');
  throw Exception(
    'Firebase project "$projectId" for $env not found '
    '(--var ${firebaseProjectVarKey(env)}=<id>). '
    'Available projects: ${available.isEmpty ? 'none' : available}',
  );
}

Future<List<Project>> runFirebaseProjectList(
    HookContext context, String token) async {
  final projectsTableResult = await Process.run(
    'pnpm',
    ['dlx', 'firebase-tools', 'projects:list', '--token', token],
  );

  final projectsTable = projectsTableResult.stdout.toString();

  return parseProjects(projectsTable, token);
}

String runFirebaseLogin(HookContext context, String environment) {
  return context.logger.prompt(
      'Specify firebase token for $environment (pnpm dlx firebase-tools login:ci):');
}

List<Project> parseProjects(String table, String firebaseToken) {
  List<Project> projects = [];
  List<String> lines = table.split('\n');

  // Trova le righe con i dati
  for (var line in lines) {
    if (line.contains('│')) {
      List<String> columns = line.split('│').map((col) => col.trim()).toList();
      if (columns.length > 2 && columns[1] != 'Project Display Name') {
        String projectDisplayName = columns[1];
        String projectId = columns[2]
            .replaceAll(' (current)', ''); // Rimuove "(current)" se presente
        projects.add(Project(projectDisplayName, projectId, firebaseToken));
      }
    }
  }

  return projects;
}

Project? chooseProject({
  required HookContext context,
  required String env,
  required List<Project> projects,
}) {
  final projectsWithEmptyProject = [
    ...projects,
    Project('Choose later', '', '')
  ];

  final choosed = context.logger.chooseOne<Project>(
    "Choose project for $env",
    choices: projectsWithEmptyProject,
    display: (choice) => choice.displayName,
  );

  if (choosed.id.trim().isEmpty) {
    return null;
  }

  return choosed;
}

class Project {
  final String displayName;
  final String id;
  final String firebaseToken;

  Project(this.displayName, this.id, this.firebaseToken);

  @override
  String toString() => 'Project Display Name: $displayName, Project ID: $id';
}
